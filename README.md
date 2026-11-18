# Animalec - Back-office (Tarefa 3.1b)

Prototipo funcional do painel de administracao do Animalec, desenvolvido no ambito da unidade curricular de Programacao Web Avancada.

O objetivo desta tarefa foi acrescentar duas novas entidades ao back-office existente do livro (Portela & Queiros): **Patrocinadores** e **Especialistas**, e integra-las com o bloco de animais ja existente.

## Estrutura do projeto

```
Tarefa_3.1b/
  docs/
    modelo-dados.md        # modelo de dados das entidades novas
  wireframes/
    wireframes.html        # wireframes de baixa fidelidade (3 ecras)
    *.png                  # capturas dos wireframes
  mockups/
    mockups.html           # mockups de alta fidelidade (2 ecras)
    ecras/                 # imagens dos mockups (desktop e telemovel)
  prototipo/
    index.html             # redireciona para o login
    login.html             # pagina de autenticacao (admin / animalec)
    admin.html             # painel principal com contagens e alertas
    animais.html           # lista de animais (com colunas novas)
    animal.html            # ficha publica do animal (pre-visualizacao)
    patrocinadores.html    # CRUD de patrocinadores
    patrocinador.html      # formulario adicionar/editar patrocinador
    especialistas.html     # CRUD de especialistas
    especialista.html      # formulario adicionar/editar especialista
    existente.html         # placeholder dos blocos do livro
    css/admin.css          # estilos (tema do Animalec)
    js/dados.js            # dados simulados em localStorage
    js/app.js              # logica de todas as paginas
    img/                   # logotipo e favicon
```

## Como correr

O prototipo e 100% client-side (HTML + CSS + JS), nao precisa de servidor nem de base de dados. Os dados ficam no `localStorage` do browser.

1. Abrir `prototipo/index.html` num browser (ou servir a pasta com qualquer servidor local)
2. Credenciais de teste: **admin** / **animalec**
3. Para repor os dados originais, clicar no botao "Repor dados" no rodape de qualquer pagina

Exemplo com Python:
```
cd prototipo
python -m http.server 8080
```
Depois abrir http://localhost:8080

## Entidades novas

### Patrocinador
Entidade que apoia o projeto atraves de apadrinhamento anual, donativo pontual ou patrocinio de quiz. Tem uma relacao N:N com os animais. Patrocinadores ativos e visiveis aparecem na ficha publica do animal.

### Especialista
Cientista que valida o conteudo das fichas dos animais. Cada especialista tem uma especialidade (grupo de animais) e pode acompanhar varios animais. Uma validacao com mais de 365 dias e sinalizada como "por rever".

### Integracao com blocos existentes
- **Painel:** contagem de patrocinadores e especialistas ativos; alertas de animais sem padrinho, fichas por validar e apoios a terminar
- **Animais:** colunas novas de patrocinio e validacao
- **Ficha publica:** mostra quem validou e quem apadrinha o animal

## Tecnologias

- HTML5, CSS3 (variaveis, grid, flexbox, media queries)
- JavaScript ES6+ (modules, localStorage, dialog API)
- Google Fonts (Montserrat + Lato)
- Sem frameworks nem dependencias externas
