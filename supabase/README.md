# Tracking do funil (Supabase)

Funil The Replay Effect (em inglês, checkout VendePay). Uma linha por visita em `public.replay_en_sessions`, atualizada a cada resposta. Os nomes são próprios (`replay_en_sessions`, `apply_replay_en_session_events`, `replay_en_funnel_by_step`, função `track-replay-en`), separados das variantes A (`replay_sessions`, `track-replay`) e B (`replay_b_sessions`, `track-replay-b`), então os funis rodam em paralelo no mesmo projeto Supabase sem misturar dados e sem um deploy sobrescrever o outro.

## Como funciona
- `progress.js` guarda cada evento numa fila em `localStorage` e envia em segundo plano para a Edge Function `track-replay-en`. Só remove da fila após resposta 2xx; falha de rede tenta de novo com espera crescente e ao voltar para a página. Em `localhost` não envia nada.
- `supabase/functions/track-replay-en` valida o payload e chama `apply_replay_en_session_events`.
- `apply_replay_en_session_events` aplica só eventos com `seq` maior que `last_seq`: reenvio não duplica e lote atrasado não volta o progresso.
- Tabela com RLS ligado e sem policies. Só a Edge Function (service role) escreve.

## Status
Ainda não publicado. O `TRACK_URL` do `progress.js` já aponta para `https://bionetfauvpcwlhqvvum.supabase.co/functions/v1/track-replay-en`; até o deploy, os envios voltam 404 e são descartados (o quiz não é afetado).

## Publicar
1. Aplicar só `migrations/20261024000000_replay_en_sessions.sql` no projeto **Grupo RME** (`bionetfauvpcwlhqvvum`), pelo SQL Editor. Não usar `supabase db push`: o projeto remoto tem migrations de outros funis que não estão nesta pasta.
2. `supabase secrets set REPLAY_EN_ALLOWED_ORIGINS=https://dominio-do-quiz.com` (vazio = qualquer origem).
3. `supabase functions deploy track-replay-en --no-verify-jwt`
4. Rode o quiz no domínio publicado e confira: `select * from replay_en_sessions order by created_at desc;` e `select * from replay_en_funnel_by_step;`.

## Eventos
`landing` (utm, referrer), `step` (tela vista: `capa`, `termino`, `contato`, `dor`, `outra`, `prazo`, `protocolo`, `saudade`, `video`, `vsl`), `answer` (resposta de cada pergunta), `checkout` (clique no botão de compra abaixo da VSL; um botão configurado dentro do painel do VTurb não passa por aqui).

O tracking cobre o quiz. Upsells e obrigado não enviam eventos. Compras: VendePay (fora deste repositório).

## Não guarda
IP, user-agent, país e e-mail.
