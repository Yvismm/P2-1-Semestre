
/*
========================================
CCP120 - PROJETO P2
SERVIDOR COMPLETO
========================================

FUNCIONALIDADES:
- Página inicial EJS
- Cadastro com GET e POST
- Consulta com GET e POST
- MongoDB
- find(), findOne(), sort(), limit()
- Servidor na porta 80
*/

// ======================================
// 1. BIBLIOTECAS
// ======================================

const express = require("express");
const mongoose = require("mongoose");

const app = express();


// ======================================
// 2. CONFIGURAÇÕES
// ======================================

// Permite utilizar arquivos EJS
app.set("view engine", "ejs");

// Permite receber dados enviados por POST
app.use(express.urlencoded({ extended: true }));

// Permite utilizar arquivos CSS
app.use(express.static("public"));


// ======================================
// 3. BANCO DE DADOS
// ======================================

// ALTERAR:
// Troque "ccp120" pelo nome do banco desejado.

mongoose.connect("mongodb://127.0.0.1:27017/ccp120")
    .then(() => console.log("MongoDB conectado"))
    .catch(erro => console.log("Erro no MongoDB:", erro));


// ======================================
// 4. MODELO PESSOA
// ======================================

// Define os campos que serão salvos.
//
// ADICIONAR:
// idade: Number
// cidade: String

const Pessoa = mongoose.model("Pessoa", {
    nome: String,
    email: String
});


// ======================================
// 5. PÁGINA INICIAL
// ======================================

// Função para abrir a página home.ejs

function abrirHome(req, res) {

    res.render("home", {

        // ALTERAR: título
        titulo: "Página Inicial",

        // ALTERAR: itens da lista
        itens: ["HTML", "CSS", "EJS"]

    });

}

// Abre a página digitando localhost
app.get("/", abrirHome);

// Abre a página digitando localhost/home.ejs
app.get("/home.ejs", abrirHome);


// ======================================
// 6. CRIAR PESSOA - GET E POST
// ======================================

// Essa função atende os dois métodos.
//
// GET:
// Os dados vêm de req.query.
//
// POST:
// Os dados vêm de req.body.

async function criarPessoa(req, res) {

    try {

        // Identifica qual método foi utilizado
        const metodo = req.method;

        // Escolhe de onde receber as informações
        let dados;

        if (metodo === "GET") {

            dados = req.query;

        } else {

            dados = req.body;

        }

        // Recebe nome e email
        const nome = String(dados.nome || "").trim();
        const email = String(dados.email || "").trim();

        // Validação dos campos
        if (!nome || !email) {

            return res.status(400).send(
                "Preencha nome e email."
            );

        }

        // CREATE():
        // Salva a nova pessoa no MongoDB.
        //
        // ADICIONAR:
        // Para salvar idade, inclua
        // idade: dados.idade

        await Pessoa.create({
            nome: nome,
            email: email
        });

        // FIND():
        // Recupera todas as pessoas cadastradas

        const pessoas = await Pessoa.find();

        // Mostra a página de resposta
        res.render("resposta", {
            pessoas: pessoas,
            consulta: "Pessoa cadastrada com " + metodo,
            metodo: metodo
        });

    } catch (erro) {

        console.log("Erro ao criar:", erro);

        res.status(500).send("Erro ao criar pessoa.");

    }

}


// ======================================
// 7. ROTAS DE CADASTRO
// ======================================

// GET - recebe informações pela URL
app.get("/criar", criarPessoa);

// POST - recebe informações pelo corpo
app.post("/criar", criarPessoa);


// ======================================
// 8. CONSULTAR - GET E POST
// ======================================

// Essa função permite usar:
// GET e POST para realizar as consultas.
//
// Os dois métodos utilizam o mesmo banco.

async function consultarPessoas(req, res) {

    try {

        // Identifica o método usado
        const metodo = req.method;

        // GET utiliza query
        // POST utiliza body

        let dados;

        if (metodo === "GET") {

            dados = req.query;

        } else {

            dados = req.body;

        }

        // Tipo de consulta selecionado
        const tipo = dados.tipo;

        // Nome utilizado na busca
        const nome = String(dados.nome || "").trim();

        // Array que guardará os resultados
        let pessoas = [];

        // Texto que aparecerá na resposta
        let consulta = "";


        // =================================
        // OPÇÃO 1 - FIND()
        // =================================

        // Busca todas as pessoas do banco.

        if (tipo === "todos") {

            pessoas = await Pessoa.find();

            consulta = "Todas as pessoas";

        }


        // =================================
        // OPÇÃO 2 - FIND({nome})
        // =================================

        // Busca pessoas com nome específico.

        else if (tipo === "nome") {

            if (!nome) {
                return res.status(400).send(
                    "Digite um nome para buscar."
                );
            }

            pessoas = await Pessoa.find({
                nome: nome
            });

            consulta = "Pessoas chamadas " + nome;

        }


        // =================================
        // OPÇÃO 3 - LIMIT(5)
        // =================================

        // Busca até cinco registros.
        //
        // ALTERAR:
        // Troque 5 por outro número.

        else if (tipo === "limite") {

            pessoas = await Pessoa.find().limit(5);

            consulta = "Até 5 pessoas";

        }


        // =================================
        // OPÇÃO 4 - SORT A-Z
        // =================================

        // 1 = ordem crescente

        else if (tipo === "az") {

            pessoas = await Pessoa.find().sort({
                nome: 1
            });

            consulta = "Ordenado de A até Z";

        }


        // =================================
        // OPÇÃO 5 - SORT Z-A
        // =================================

        // -1 = ordem decrescente

        else if (tipo === "za") {

            pessoas = await Pessoa.find().sort({
                nome: -1
            });

            consulta = "Ordenado de Z até A";

        }


        // =================================
        // OPÇÃO 6 - FINDONE()
        // =================================

        // Busca apenas uma pessoa.
        //
        // findOne() retorna um objeto
        // ou null, e não um array.

        else if (tipo === "um") {

            if (!nome) {
                return res.status(400).send(
                    "Digite um nome para buscar."
                );
            }

            const pessoa = await Pessoa.findOne({
                nome: nome
            });

            // Transforma o objeto em array
            // para funcionar no EJS.

            if (pessoa) {

                pessoas = [pessoa];

            }

            consulta = "Uma pessoa chamada " + nome;

        }


        // =================================
        // OPÇÃO PADRÃO
        // =================================

        else {

            pessoas = await Pessoa.find();

            consulta = "Todas as pessoas";

        }


        // =================================
        // MOSTRAR RESULTADOS
        // =================================

        // Envia os dados para resposta.ejs

        res.render("resposta", {
            pessoas: pessoas,
            consulta: consulta,
            metodo: metodo
        });

    } catch (erro) {

        console.log("Erro na consulta:", erro);

        res.status(500).send(
            "Erro ao consultar pessoas."
        );

    }

}


// ======================================
// 9. ROTAS DE CONSULTA
// ======================================

// GET - parâmetros pela URL
app.get("/consultar", consultarPessoas);

// POST - parâmetros pelo corpo
app.post("/consultar", consultarPessoas);


// ======================================
// 10. INICIAR SERVIDOR
// ======================================

// Porta 80 exigida pelo professor.

app.listen(80, () => {

    console.log("Servidor iniciado!");
    console.log("http://localhost");
    console.log("http://localhost/home.ejs");

});
