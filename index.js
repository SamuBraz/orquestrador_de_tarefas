import express from 'express';
import { randomUUID } from 'node:crypto';


const app = express();
const ip = '127.0.0.1'
const port = 3000;

// // // Helpers

const STATUS_VALIDOS = ['a fazer', 'em andamento', 'concluída'];
const CAMPOS_OBRIGATORIOS = ['Name', 'Description', 'Status', 'Dead_line'];

function isDataValida(str) {

  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(str);
  if (!match) return false;

  const mes = Number(match[1]);
  const dia = Number(match[2]);
  const ano = Number(match[3]);

  
  const data = new Date(ano, mes - 1, dia);
  return (
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia
  );
}

function verifyTaskUpload(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { valido: false, erros: ['O body deve ser um objeto JSON.'] };
  }

  const erros = [];

  // 1. Campos obrigatórios
  for (const campo of CAMPOS_OBRIGATORIOS) {
    const valor = body[campo];
    if (valor === undefined || valor === null) {
      erros.push(`O campo "${campo}" é obrigatório.`);
    } else if (typeof valor !== 'string' || valor.trim() === '') {
      erros.push(`O campo "${campo}" deve ser um texto não vazio.`);
    }
  }

  // 2. Campos não estão no padrão da requisição
  let campos_requisicao = Object.keys(body);
  console.log(campos_requisicao)
  for (let campo_atual of campos_requisicao){
    if (!CAMPOS_OBRIGATORIOS.includes(campo_atual)){
      //TODO: Ajustar erro que na resposta fica /id o valor do campo atual.
      erros.push(`O campo "${campo_atual}" não está no padrão da requisição. Os campos que precisam estar presentes são: ${CAMPOS_OBRIGATORIOS.join(', ')}`);
    }
  }


  if (erros.length > 0) return { valido: false, erros };

  if (!STATUS_VALIDOS.includes(body.Status.trim().toLowerCase())) {
    erros.push(`Status inválido. Use um destes: ${STATUS_VALIDOS.join(', ')}.`);
  }

  if (!isDataValida(body.Dead_line.trim())) {
    erros.push('Dead_line inválida. Use o formato MM-DD-YYYY (ex: 11-28-2026).');
  }

  return { valido: erros.length === 0, erros };
}

// // // Routes
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ name: 'tasks-api', version: '1.0.0' });
})

app.post('/tasks', (req, res) => {
  const { valido, erros } = verifyTaskUpload(req.body);
  if (!valido) {
    return res.status(400).json({ erros });
  }
  res.status(201).send(`task ${req.body.Name}`);
})


app.listen(port, ip, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});