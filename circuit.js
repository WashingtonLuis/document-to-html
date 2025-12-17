export function circuit(text) {
	// 1️⃣ Padronizações gerais
	text = padronizaCircuit(text);
	text = corrigirPalavras(text);

	// 2️⃣ Normaliza TODAS as linhas primeiro
	text = text
		.split(/\n+/)
		.map((l) => normalizarLinhaTabs(l.replace(/\t{2,}/g, '\t').trim()))
		.filter((l) => l && !l.startsWith('# Address') && !l.startsWith('<br>'))
		.join('\n');

	text = text.replace(/\t\t(\d{5}-\d{3})/g, '\t\t\t$1');

	// 3️⃣ Processa linha por linha
	const resultado = [];

	for (const linha of text.split('\n')) {
		if (!linha || !linha.replace(/\t/g, '').trim()) continue;

		const parsed = parseEndereco(linha);

		if (!parsed) {
			console.warn('❌ Endereço não reconhecido:', JSON.stringify(linha));
			continue;
		}

		resultado.push(enderecoParaLinha(parsed));
	}

	// 4️⃣ Retorna SEMPRE com cabeçalho
	return resultado.join('\n');
}
function extrairBairroCep(texto = '') {
	let bairro = texto;
	let cep = '';

	const m = texto.match(/(\d{5}-\d{3})/);
	if (m) {
		cep = m[1];
		bairro = texto.replace(m[1], '');
	}

	bairro = bairro
		.replace(/uberaba/gi, '')
		.replace(/minas gerais/gi, '')
		.replace(/[,\s]+$/g, '')
		.trim();

	return { bairro, cep };
}
function corrigirEnderecoQuebrado(cols) {
	// caso: Endereço, Nº e Bairro vieram juntos
	if (!cols[2] && /,\s*\d+/.test(cols[1])) {
		const m = cols[1].match(/^(.*?),\s*(\d+)(.*)$/);
		if (m) {
			cols[1] = m[1].trim();
			cols[2] = m[2];
			cols[3] = m[3].replace(/^[,\s]+/, '');
		}
	}
	return cols;
}
function garantirArrayColunas(cols, total = 11) {
	while (cols.length < total) cols.push('');
	return cols.slice(0, total);
}

function garantirLinhaColunas(cols, total = 11) {
	return garantirArrayColunas(cols, total).join('\t');
}

function limparBairro(bairro) {
	if (!bairro) return '';
	if (/^(uberaba|minas gerais)$/i.test(bairro.trim())) return '';
	return bairro.trim();
}
function padronizaCircuit(text) {
	text = text

		// 🔒 PROTEÇÃO ABSOLUTA (PRIMEIRO DE TUDO)
		.replace(/(\d{5}-\d{3})/g, '§CEP:$1§')
		.replace(/(\d{2}:\d{2})/g, '§HORA:$1§')

		// ----------------------------
		// LIMPEZA DE HTML
		// ----------------------------
		.replace(/<p># Address<\/p>\n?<p>Estimated Arrival<\/p>\n?<p>Time<\/p>\n?<p>Actual Arrival Time Notes<\/p>\n?/gi, '')
		.replace(/<p># Address<\/p>\n?<p>Estimated<\/p>\n?<p>Arrival Time<\/p>\n?<p>Notes<\/p>\n?/gi, '')
		.replace(/<\/p>\n?<p>(\d+,)/gi, '$1')
		.replace(/(?<=<p>\d+)<\/p>\n<p>(?=Rua|Avenida)/gi, '\t')
		.replace(/<\/p>\n?<p>((?:\d+)? ?min)/gi, '$1')
		.replace(/<\/p>\n?<p>((?:\d+)? ?h ?\d+ ?min)/gi, '$1')
		.replace(/(\d+-)<\/p>\n<p>(\d+)/gi, '$1$2')
		.replace(/(\d+)<\/p>\n<p>(-\d+)/gi, '$1$2')
		.replace(/<p>/gi, '')
		.replace(/<\/p>/gi, '\n')
		.replace(/\# Address Estimated Arrival Time Actual Arrival Time Notes/gi, '')
		.replace(/\n\n/g, '\n')

		// ----------------------------
		// NORMALIZA TEXTO
		// ----------------------------
		.replace(/[ ]+/gi, ' ')
		.replace(/\bR\.\s+/gi, 'Rua ')
		.replace(/apto\b|apartamento|apt\b|AP\b/gi, 'ap')
		.replace(/bloco|bl\b/gi, 'b')
		.replace(/torre|T\b/gi, 't')

		// ----------------------------
		// TABULAÇÃO CONTROLADA
		// ----------------------------
		.replace(/(?<=\n\d+) /gi, '\t')
		.replace(/(?<=\d+) (?=Rua|Avenida)/gi, '\t')
		.replace(/minas Gerais,/gi, '\t')
		.replace(/\t(?:Uberaba|minas Gerais)\t/gi, '\t')

		// ----------------------------
		// LIMPEZA FINAL
		// ----------------------------
		.replace(/\t?\((?:Adiantado|Atrasado).*?\)/gi, '')
		.replace(/\t+/g, '\t')
		.replace(/\t[ ]+/g, '\t')
		.replace(/<div><br><\/div>/gi, '')
		.replace(/^\n1/gi, '1')

		// ----------------------------
		// 🔓 RESTAURA PROTEÇÕES (ÚLTIMO PASSO)
		// ----------------------------
		.replace(/§CEP:(\d{5}-\d{3})§/g, '\t$1\t')
		.replace(/§HORA:(\d{2}:\d{2})§/g, '\t$1\t');

	return text;
}
function parseEndereco(linha) {
	let cols = linha.split('\t').map((c) => c.trim());
	cols = garantirArrayColunas(cols);
	cols = corrigirEnderecoQuebrado(cols);

	let [id, endereco, numero, bairroRaw, cepRaw, estimativa, entrega, notas, data, qtd, situacao] = cols;

	({ bairro: bairroRaw, cep: cepRaw } = extrairBairroCep([bairroRaw, cepRaw].join(' ')));

	return {
		id,
		endereco,
		numero,
		bairro: bairroRaw,
		cep: cepRaw,
		estimativa,
		entrega,
		notas,
		data,
		qtd,
		situacao,
	};
}
function normalizarLinhaTabs(linha) {
	// quebra em colunas
	let cols = linha.split('\t').map((c) => c.trim());

	// remove vírgula final do bairro
	if (cols[3]) {
		cols[3] = cols[3].replace(/,+$/, '');
	}

	// remove colunas vazias excedentes
	cols = cols.filter((c, i) => !(c === '' && cols[i - 1] === ''));

	while (cols.length < 11) cols.push('');
	return cols.slice(0, 11).join('\t');
}
function enderecoParaLinha(obj) {
	return garantirLinhaColunas([obj.id, obj.endereco, obj.numero, limparBairro(obj.bairro), obj.cep, obj.estimativa, obj.entrega, obj.notas || '', obj.data || '', obj.qtd || '', obj.situacao || '']);
}
function corrigirPalavras(texto) {
	const regras = [
		{ correto: 'mecânica', base: 'mecânica' },
		{ correto: 'Uberaba', base: 'Uberaba' },
		{ correto: 'Cartafina', base: 'Cartafina' },
		{ correto: 'rota', base: 'rota' },
		{ correto: 'Costa', base: 'Costa' },
		{ correto: 'min', base: 'min' },
		{ correto: 'Prata', base: 'Prata' },
		{ correto: 'Oliveira', base: 'Oliveira' },
		{ correto: 'Oliveira Prata', base: 'Oliveira Prata' },
		{ correto: 'morador', base: 'morador' },
		{ correto: 'Abadia', base: 'Abadia' },
		{ correto: 'Silva', base: 'Silva' },
		{ correto: 'Adiantado', base: 'Adiantado' },
		{ correto: 'Atrasado', base: 'Atrasado' },
		{ correto: 'Umuarama', base: 'Umuarama' },
		{ correto: 'Palmeiras', base: 'Palmeiras' },
		{ correto: 'tutunas', base: 'tutunas' },
		{ correto: 'Freire', base: 'Freire' },
		{ correto: 'Sol', base: 'Sol' },
		{ correto: 'Canadá', base: 'Canadá' },
		{ correto: 'Residencial', base: 'Residencial' },
		{ correto: 'Alfredo', base: 'Alfredo' },
		{ correto: 'Gerais', base: 'Gerais' },
		{ correto: 'Borges', base: 'Borges' },
		{ correto: 'Beija-Flor', base: 'Beija-Flor' },
		{ correto: 'Conjunto', base: 'Conjunto' },
		{ correto: 'minas', base: 'minas' },
		{ correto: 'Morumbi', base: 'Morumbi' },
		{ correto: 'Professor', base: 'Professor' },
		{ correto: 'Pacaembu', base: 'Pacaembu' },
		{ correto: 'bloco', base: 'boco' },
		{ correto: 'ramid', base: 'ramid' },
		{ correto: 'Mauad', base: 'Mauad' },
		{ correto: 'espanha', base: 'espanha' },
		{ correto: 'Derenusson', base: 'Derenusson' },
	];

	for (const { correto, base } of regras) {
		// Monta regex tipo m\s*e\s*c\s*â\s*n\s*i\s*c\s*a
		const regex = new RegExp(`(?<!\\d)${base.split('').join('\\s*')}(?!\\d)`, 'gi');

		texto = texto.replace(regex, correto);

		// const regexQuebra = new RegExp(
		//   "(?:\\t|\\n)\\s*" + base,
		//   "gi"
		// );
		// texto = texto.replace(regexQuebra, "\t" + correto);
	}

	return texto;
}
