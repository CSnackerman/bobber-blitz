import { AuthError, AuthResponse } from '@supabase/supabase-js';
import { getErrorDisplayMessage, logError } from '../../core/error.ts';
import supabase, {
  getUserAvatar,
  getUserLoginStatus,
  GoogleAvatar,
  initSupabaseSession,
  logout,
  UserStatus,
} from '../../core/supabase.ts';
import template from './template.html?raw';

const { VITE_OAUTH_REDIRECT_URL: OAUTH_REDIRECT = 'https://bobber-blitz.netlify.app' } = import.meta.env;

type Provider = 'anonymous' | 'google' | 'email-password';
type AvatarSrc = 'avatar-default.svg' | 'google-g-logo.svg' | 'propeller.svg' | GoogleAvatar;
type Expanded = undefined | false | true;

interface UiLoginState {
  userStatus: UserStatus;
  provider: Provider;
  avatarSrc: AvatarSrc;
  showTitle: boolean;
  offlineExpanded: Expanded;
  onlineExpanded: Expanded;
}

customElements.define(
  'ui-login',
  class extends HTMLElement {
    state: UiLoginState;

    constructor() {
      super();
      this.state = {
        userStatus: 'offline',
        provider: 'anonymous',
        avatarSrc: 'avatar-default.svg',
        showTitle: true,
        offlineExpanded: false,
        onlineExpanded: undefined,
      };
      this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
      await initSupabaseSession();
      await this.render();
    }

    private el<T extends HTMLElement>(query: string) {
      return this.shadowRoot!.querySelector<T>(query) as T;
    }

    private loginTitle = () => this.el<HTMLHeadingElement>('#login-title');
    private rootButton = () => this.el<HTMLButtonElement>('#root-button');
    private rootImage = () => this.el<HTMLImageElement>('#root-button-img');
    private emailLoginButton = () => this.el<HTMLButtonElement>('#email-login-button');
    private emailLoginButtonImage = () => this.el<HTMLImageElement>('#provider-email');
    private googleLoginButton = () => this.el<HTMLButtonElement>('#google-login-button');
    private googleLoginButtonImage = () => this.el<HTMLImageElement>('#provider-google');
    private emailLoginDialog = () => this.el<HTMLDialogElement>('dialog');
    private emailDialogExitButton = () => this.el<HTMLButtonElement>('#exit-dialog');
    private emailInput = () => this.el<HTMLInputElement>('input[type="email"]');
    private passwordInput = () => this.el<HTMLInputElement>('input[type="password"]');
    private emailRegisterSubmit = () => this.el<HTMLButtonElement>('#email-register-submit');
    private emailLoginSubmit = () => this.el<HTMLButtonElement>('#email-login-submit');

    private async render() {
      this.shadowRoot!.innerHTML = template;
      await this.syncState();
      this.syncShadowRoot();

      if (this.isOfflineOrAnonymous()) {
        this.addLoggedOffEventListeners();
      } else {
        this.addLoggedOnEventListeners();
      }
    }

    private async syncState() {
      this.state.userStatus = await getUserLoginStatus();

      if (this.isOfflineOrAnonymous()) {
        this.state.provider = 'anonymous';
        this.state.avatarSrc = 'avatar-default.svg';
      } else {
        this.state.offlineExpanded = undefined;
        this.state.showTitle = false;
        this.state.avatarSrc = (await getUserAvatar()) ?? 'propeller.svg';
      }
    }

    private syncShadowRoot() {
      const { showTitle, avatarSrc, offlineExpanded: expanded } = this.state;

      showTitle
        ? (this.loginTitle().style.display = 'block')
        : (this.loginTitle().style.display = 'none');

      this.rootImage().src = avatarSrc;

      const hasOpen = this.emailLoginDialog().hasAttribute('open');
      if (expanded && !hasOpen) this.emailLoginDialog().setAttribute('open', '');
      else if (!expanded && hasOpen) this.emailLoginDialog().removeAttribute('open');

      if (this.isOnline()) {
        this.emailLoginButtonImage().src = 'gear.svg';
        this.googleLoginButtonImage().src = 'logout-icon.svg';
      }
    }

    private isOfflineOrAnonymous() {
      return this.state.userStatus === 'offline' || this.state.userStatus === 'anonymous';
    }

    private isOnline() {
      return this.state.userStatus === 'online';
    }

    private toggleExpanded() {
      this.state.offlineExpanded = !this.state.offlineExpanded;
      this.setProvidersVisibility(this.state.offlineExpanded);
    }

    private setProvidersVisibility(expanded: Expanded) {
      [this.emailLoginButton(), this.googleLoginButton()].forEach((button) => {
        if (expanded) button.style.visibility = 'visible';
        else button.style.visibility = 'hidden';
      });
    }

    private toggleEmailLoginDialog() {
      this.emailLoginDialog().hasAttribute('open')
        ? this.emailLoginDialog().removeAttribute('open')
        : this.emailLoginDialog().setAttribute('open', '');
    }

    private addLoggedOnEventListeners() {
      // root button
      this.rootButton().onclick = () => {
        this.toggleExpanded();
      };

      // options button
      // TODO

      // logout button
      this.googleLoginButton().onclick = async () => {
        await logout();
        window.location.reload();
      };
    }

    private addLoggedOffEventListeners() {
      if (this.state.offlineExpanded !== undefined) {
        this.rootButton().onclick = () => {
          if (this.state.offlineExpanded !== undefined) {
            this.toggleExpanded();
          }
        };
      }

      // email login
      this.emailLoginButton().onclick = () => this.toggleEmailLoginDialog();
      this.emailDialogExitButton().onclick = () => this.toggleEmailLoginDialog();

      const handleSubmit = async (e: MouseEvent, type: 'register' | 'login') => {
        e.preventDefault();

        const email = this.emailInput().value ?? '';
        const password = this.passwordInput().value ?? '';

        try {
          if (!email && !password) throw new AuthError('', 400, 'empty email password');
          if (!email) throw new AuthError('', 400, 'empty email');
          if (!password) throw new AuthError('', 400, 'empty password');

          let response: AuthResponse | undefined = undefined;
          if (type === 'register') {
            response = await supabase.auth.signUp({ email, password });
          } else if (type === 'login') {
            response = await supabase.auth.signInWithPassword({ email, password });
          }

          if (!response || response.error)
            throw response?.error ?? `email ${type} response not received`;

          const {
            data: { user },
            error,
          } = await supabase.auth.getUser();

          if (error || !user) {
            logError(error ?? new AuthError('user not found'));
            return;
          }

          setTimeout(() => {
            this.emailLoginDialog().removeAttribute('open');
          }, 3000);

          this.emailLoginDialog().innerHTML = `✅ Logged in as ${user.email}`;
          this.state.userStatus = 'online';
          this.state.provider = 'email-password';
          this.state.avatarSrc = 'propeller.svg';
          this.state.offlineExpanded = undefined;
          this.loginTitle().style.display = 'none';
          await this.render();
        } catch (err) {
          logError(err);
          alert(getErrorDisplayMessage(err));
        }
      };

      this.emailRegisterSubmit().onclick = (e) => handleSubmit(e, 'register');
      this.emailLoginSubmit().onclick = (e) => handleSubmit(e, 'login');

      document.body.addEventListener('click', () => {
        if (this.state.userStatus === 'online' && this.emailLoginDialog().hasAttribute('open')) {
          this.emailLoginDialog().removeAttribute('open');
        }
      });

      // google login
      this.googleLoginButton().onclick = () => this.onClickGoogleSignIn();
    }

    private async onClickGoogleSignIn() {
      try {
        const userStatus = await getUserLoginStatus();

        if (userStatus === 'online') throw new AuthError('already signed in');

        const response = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: OAUTH_REDIRECT,
          },
        });

        if (response.error) throw response.error;

        this.state.userStatus = 'online';
        this.state.provider = 'google';
        this.state.avatarSrc = 'google-g-logo.svg';
        this.state.offlineExpanded = undefined;
        this.loginTitle().style.display = 'none';
        await this.render();
      } catch (err) {
        logError(err);
      }
    }
  },
);
