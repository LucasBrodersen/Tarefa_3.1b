# Modelo de dados das entidades novas

```
Animal (existente)  1 ─── N  Apoio  N ─── 1  Patrocinador
Animal (existente)  N ───────────── N  Especialista   (+ data da última validação por animal)
```

## Patrocinador (sponsor)

| Campo | Tipo | Regras |
| --- | --- | --- |
| id | inteiro | gerado |
| nome | texto (≤ 80) | obrigatório |
| tipo | Empresa · ONG · Escola · Particular | obrigatório |
| email | email | obrigatório |
| website | URL | opcional |
| modalidade | apadrinhamento · donativo · quiz | obrigatório |
| valorAnual | número (€) | obrigatório, ≥ 0; num donativo é o valor único |
| inicio, fim | data | fim ≥ início; num donativo fim = início |
| animais | lista de ids de Animal | ≥ 1 exceto em donativos |
| mostrarNaApp | booleano | se verdadeiro, aparece na ficha pública dos animais |
| ativo | booleano | só os ativos contam para totais e ficha pública |
| notas | texto (≤ 300) | uso interno |

## Especialista (expert)

| Campo | Tipo | Regras |
| --- | --- | --- |
| id | inteiro | gerado |
| nome | texto (≤ 80) | obrigatório |
| titulo | Doutora · Doutor · Mestre · Licenciada · Licenciado | obrigatório |
| instituicao | texto com sugestões | obrigatório |
| email | email | obrigatório |
| orcid | texto `0000-0000-0000-000X` | opcional, formato validado |
| especialidade | grupo de animais (mamífero, ave, réptil, anfíbio, peixe, invertebrado) | obrigatório; filtra a lista de animais |
| animais | lista de ids de Animal | ≥ 1 |
| revisoes | mapa id do animal → data da última validação | validação com mais de 365 dias = "por rever" |
| validaQuizzes | booleano | também valida questões dos quizzes |
| ativo | booleano | |
| bio | texto (≤ 300) | |

## Regras que ligam as entidades aos blocos existentes

- **Painel:** contagem de patrocinadores e especialistas ativos; alertas de animais sem padrinho, fichas por validar e apoios a terminar nos próximos 45 dias.
- **Animais:** coluna "Patrocínio" (patrocinadores ativos) e coluna "Validação" (estado mais recente entre os especialistas ativos).
- **Ficha pública:** "Conteúdo revisto por… em…" e lista de padrinhos com `mostrarNaApp`.
