# app/data — dados da dieta

Os JSON aqui são **cópias de trabalho** de `PT/Dietary program/app_data/`, que é a fonte de verdade
(gerada pela sessão de nutrição a partir de `BASE_ALIMENTAR.md` e `RECEITAS.md`).

O app faz `fetch("data/*.json")` em vez de embutir os dados no `index.html` de propósito: quando o
bloco muda, **não se toca em código**.

## Como atualizar o plano (ex.: 24/08 → bloco de 2.300 kcal)

```bash
cd ~/Desktop/Agents/PT
cp "Dietary program/app_data/dieta.json" "Dietary program/app_data/receitas.json" app/data/
# bump obrigatório do cache, senão o celular serve a versão antiga:
#   app/sw.js → const CACHE = "lucas-pt-vN+1"
cd app && git add -A && git commit -m "Atualiza dados da dieta" && git push origin main
```

Depois: no iPhone, fechar e reabrir o app 2× (troca o service worker).

## Contratos que o app depende

Se a estrutura mudar, `renderDieta()` / `renderReceitas()` em `index.html` precisam acompanhar:

- `dieta.json`
  - `bloco` — usa `nome, inicio, fim, kcal_alvo, prot_alvo, gord_alvo, agua_alvo_l, deficit_dia, deficit_pct, gordura_semana_kg, proposito, saida_obrigatoria.{data,kcal}`
  - `refeicoes_dia_escalada_manha` / `refeicoes_dia_sem_escalada` — `{rotulo, total_kcal, total_prot, slots[]}`;
    cada slot: `hora, nome, kcal|kcal_min+kcal_max, prot`, e **um** de `opcoes_ref` (nome de um array top-level) ou `receita_id` (id em `receitas.json → shakes`)
  - `opcoes_ref: "sobremesas"` é tratado à parte — `sobremesas` é objeto de regras, não lista de opções
  - opções (`cafes`/`almocos`/`pretreinos`/`jantares`): `id, nome, itens[], kcal, prot`; opcionais `tempo_min, tag, nota, fibra, destaque, kcal_sem_pao, prot_sem_pao`
  - `checklist_diario[]` — `id, label`; flags `critico, condicional` (só aparece em dia de escalada), `noturno`
  - `item_fixo_diario`, `sobremesas`, `semana_tipo[]`, `semana_fechamento`, `substituicoes`, `regra_*`, `escalada`, `delivery`, `dia_impossivel[]`, `stop_rules[]`, `fibra`, `suplementos[]`, `compras_semanais`
- `receitas.json` — `categorias[]` (`id, nome, emoji, composicao, slot, frequencia, funcao, faixa_kcal[], faixa_prot[], regra`), `receitas[]` (`id, nome, categoria, ingredientes[], kcal_porcao, prot_porcao`; opcionais `fibra_porcao, nota, do_lucas, base`), `shakes[]`, `tecnica[]`, `regras_globais[]`

## Regras de UI que não podem ser violadas

1. **Nunca** transformar a aba Dieta em food logger: sem input de alimento, sem somar kcal do dia. Os números são consulta.
2. Macros de receita são **por porção** (cada receita rende 3). Nunca exibir batelada sem rotular.
3. Só a categoria `proteico` pode ocupar o slot das 17:30.
4. **Strings do JSON vão direto pra tela** — precisam vir acentuadas (os arquivos foram corrigidos em 25/07; se forem regerados, manter os acentos).
