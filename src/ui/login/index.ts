import { logError } from '../../core/error.ts';
import supabase, {
  getUserAvatar,
  getUserLoginStatus,
  Status_Anonymous,
  Status_LoggedIn,
} from '../../core/supabase.ts';
import template from './template.html?raw';

customElements.define(
  'ui-login',
  class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    private async render() {
      this.shadowRoot!.innerHTML = template;

      this.addEventListener('click', this.onClick);

      await this.sync();
    }

    private async onClick() {
      try {
        const userLoginStatus = await getUserLoginStatus();
        switch (userLoginStatus) {
          case null:
          case Status_Anonymous:
            await supabase.auth.signInWithOAuth({ provider: 'google' });
            break;
          case Status_LoggedIn:
            const { error } = await supabase.auth.signOut({
              scope: 'global',
            });
            if (error) throw error;
            location.reload();
            break;
        }
      } catch (err) {
        logError(err);
      }
    }

    private async sync() {
      const userLoginStatus = await getUserLoginStatus();

      switch (userLoginStatus) {
        case Status_LoggedIn:
          const avatar = await getUserAvatar();
          const button = this.shadowRoot!.querySelector('button');
          const img = this.shadowRoot!.querySelector('img');
          button!.classList.add('login-avatar');
          img!.classList.add('login-avatar');
          img!.src = avatar ?? '#';
          return;
        default:
          return;
      }
    }

    async connectedCallback() {
      await this.render();
    }
  }
);
