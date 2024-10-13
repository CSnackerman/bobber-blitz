import { describe, expect, test } from 'vitest';
import supabase from '../src/core/supabase.ts';

describe('network tests', async () => {
  test('public.spawn_fish', async () => {
    const result = await supabase.rpc('spawn_fish', {
      user_id: 'cf836d11-a91f-4117-b22c-1a6c8674ebc1',
    });
    console.log(result);
    expect(result.error).toBeNull();
    expect(result.status).eq(200);
  });
});
