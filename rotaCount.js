const padrao = /\b(Rua|R\.|Avenida|Av\.?|Travessa|Tv\.?|Alameda|Al\.)\s+([A-Za-zÀ-ÿ\s]+?),\s*(\d+)/gi;

export async function rotaCount() {
	await processarPDF();
}

function normalizarTipo(tipo) {
	tipo = tipo.toLowerCase();

	if (tipo.startsWith('r')) return 'rua';
	if (tipo.startsWith('av')) return 'avenida';
	if (tipo.startsWith('tv')) return 'travessa';
	if (tipo.startsWith('al')) return 'alameda';

	return 'outros';
}

function limparTexto(texto) {
	texto = texto.replace(/(\d)\n(\d)/g, '$1$2');
	texto = texto.replace(/([a-zA-Z])\n([a-zA-Z])/g, '$1 $2');
	texto = texto.replace(/\n+/g, '\n');
	return texto;
}

function capitalizar(texto) {
	return texto
		.split(' ')
		.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
		.join(' ');
}

function extrairEnderecos(texto) {
	const enderecosUnicos = new Set();
	const listaTuplas = [];
	let totalEncontrados = 0;

	const encontrados = [...texto.matchAll(padrao)];

	for (const match of encontrados) {
		const tipo = match[1];
		const nome = match[2];
		const numero = match[3];

		const tipoNorm = normalizarTipo(tipo);
		const nomeLimpo = nome.trim().toLowerCase().replace(/\s+/g, ' ');
		const numeroInt = parseInt(numero, 10);

		// Excluir Rua Felipe dos Santos, 400
		if (tipoNorm === 'rua' && nomeLimpo === 'felipe dos santos' && numeroInt === 400) {
			continue;
		}

		totalEncontrados++;

		const chave = `${tipoNorm}|${nomeLimpo}|${numero}`;

		if (!enderecosUnicos.has(chave)) {
			enderecosUnicos.add(chave);
			listaTuplas.push({
				tipo: tipoNorm,
				nome: nomeLimpo,
				numero: numeroInt,
			});
		}
	}

	listaTuplas.sort((a, b) => {
		if (a.nome < b.nome) return -1;
		if (a.nome > b.nome) return 1;
		return a.numero - b.numero;
	});

	const listaFormatada = listaTuplas.map((item) => {
		return `${capitalizar(item.tipo)} ${capitalizar(item.nome)}, ${item.numero}`;
	});

	return {
		totalEncontrados,
		totalUnicos: enderecosUnicos.size,
		lista: listaFormatada,
	};
}

async function processarPDF() {
	const input = document.getElementById('pdfFile');
	const resultado = document.getElementById('result');

	if (!input.files.length) {
		resultado.textContent = 'Selecione um arquivo PDF.';
		return;
	}

	const arquivo = input.files[0];

	if (arquivo.type !== 'application/pdf') {
		resultado.textContent = '❌ Envie apenas arquivos PDF.';
		return;
	}

	resultado.textContent = 'Analisando PDF...';

	try {
		const arrayBuffer = await arquivo.arrayBuffer();
		const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

		let textoTotal = '';

		for (let i = 1; i <= pdf.numPages; i++) {
			const pagina = await pdf.getPage(i);
			const content = await pagina.getTextContent();

			const textoPagina = content.items.map((item) => item.str).join(' ');
			textoTotal += textoPagina + '\n';
		}

		const textoLimpo = limparTexto(textoTotal);

		const dados = extrairEnderecos(textoLimpo);

		let resposta = '';
		resposta += `📊 Total de endereços encontrados: ${dados.totalEncontrados}\n`;
		resposta += `📊 Total de endereços únicos: ${dados.totalUnicos}\n\n`;
		resposta += '📍 Lista de endereços:\n\n';

		dados.lista.forEach((endereco, index) => {
			resposta += `${index + 1}. ${endereco}\n`;
		});

		resultado.textContent = resposta;
	} catch (erro) {
		resultado.textContent = `❌ Erro ao processar o PDF:\n${erro.message}`;
	}
}
