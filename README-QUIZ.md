# Quiz ENEM - Aplicação Frontend

Uma aplicação web moderna para praticar questões do ENEM com interface interativa e resultados detalhados.

## 🚀 Funcionalidades

### 📋 Seleção de Disciplinas
- **Quiz Completo**: Todas as disciplinas com aproximadamente 180 questões
- **Disciplinas Específicas**: Escolha entre:
  - Matemática e suas Tecnologias (🔢)
  - Ciências da Natureza e suas Tecnologias (🔬)
  - Ciências Humanas e suas Tecnologias (🌍)
  - Linguagens, Códigos e suas Tecnologias (📚)

### 🎯 Interface do Quiz
- **Cronômetro**: Acompanhe o tempo gasto em tempo real
- **Progresso Visual**: Barra de progresso e indicadores de questões respondidas
- **Navegação Livre**: Vá e volte entre as questões livremente
- **Design Responsivo**: Funciona em desktop, tablet e mobile

### 📊 Resultados Detalhados
- **Estatísticas Completas**: Acertos, erros e aproveitamento
- **Tempo Total**: Tempo gasto no quiz
- **Revisão das Questões**: Veja todas as questões com suas respostas
- **Feedback Visual**: Cores e mensagens baseadas no desempenho

## 🛠️ Tecnologias Utilizadas

- **Next.js 15**: Framework React para produção
- **TypeScript**: Tipagem estática para maior segurança
- **Tailwind CSS**: Estilização moderna e responsiva
- **Axios**: Cliente HTTP para consumir a API
- **React Hooks**: Gerenciamento de estado moderno

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 18 ou superior
- npm ou yarn
- API do ENEM rodando em `http://localhost:3000`

### Instalação
```bash
# Clone o repositório
git clone [URL_DO_REPOSITORIO]

# Entre no diretório
cd enem-front

# Instale as dependências
npm install

# Execute em modo de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3001`

## 🔧 Configuração da API

Certifique-se de que a API do ENEM está rodando em `http://localhost:3000`. 

A aplicação consome os seguintes endpoints:
- `GET /enem/disciplines` - Lista as disciplinas disponíveis
- `GET /enem/questions` - Lista questões (com filtros opcionais)
- `GET /enem/questions/random` - Questão aleatória

## 🎮 Como Usar

### 1. Seleção de Disciplina
- Ao abrir a aplicação, você verá as opções de disciplinas
- Escolha "Todas as Disciplinas" para um quiz completo
- Ou selecione uma disciplina específica

### 2. Respondendo o Quiz
- Leia a questão e o contexto fornecido
- Selecione uma das alternativas (A, B, C, D, E)
- Use os botões "Anterior" e "Próxima" para navegar
- O cronômetro mostra o tempo decorrido

### 3. Finalizando
- Clique em "Finalizar" na última questão
- Veja seus resultados detalhados
- Revise as questões que errou
- Escolha "Refazer Quiz" ou "Voltar ao Menu"

## 📱 Interface Responsiva

A aplicação foi desenvolvida com design responsivo:
- **Desktop**: Interface completa com todos os recursos
- **Tablet**: Layout adaptado para telas médias
- **Mobile**: Interface otimizada para smartphones

## 🎨 Personalização

### Cores e Tema
- Azul: Elementos ativos e botões principais
- Verde: Questões respondidas corretamente
- Vermelho: Questões incorretas
- Cinza: Elementos neutros e desabilitados

### Componentes Principais
- `DisciplineSelection`: Seleção de disciplinas
- `QuizQuestion`: Interface da questão
- `QuizResults`: Resultados e revisão
- `Timer`: Cronômetro do quiz
- `Loading`: Telas de carregamento

## 📊 Métricas de Desempenho

O sistema calcula:
- **Aproveitamento**: Porcentagem de acertos
- **Tempo por questão**: Tempo médio gasto
- **Classificação**: Baseada no aproveitamento
  - 80%+ = Excelente
  - 60-79% = Bom trabalho
  - 40-59% = Pode melhorar
  - <40% = Continue estudando

## 🔄 Fluxo da Aplicação

1. **Seleção** → Escolha da disciplina
2. **Loading** → Carregamento das questões
3. **Quiz** → Resposta das questões
4. **Resultados** → Análise do desempenho

## 🐛 Tratamento de Erros

- **API offline**: Mensagem clara com botão para tentar novamente
- **Questões não encontradas**: Redirecionamento para seleção
- **Timeout**: Indicação visual de problemas de conexão

## 🚀 Deploy

Para fazer deploy da aplicação:

```bash
# Build para produção
npm run build

# Iniciar servidor de produção
npm start
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🤝 Contribuições

Contribuições são bem-vindas! Por favor:
1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou suporte:
- Abra uma issue no GitHub
- Consulte a documentação da API
- Verifique os logs do console do navegador

---

**Desenvolvido para estudantes do ENEM** 🎓
