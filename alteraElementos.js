import { tagImg } from './script.js';

export function alteraElementos(html) {
	var tempDiv = $('<div>').html(html);

	tempDiv.find('colgroup').remove();

	tempDiv[0].querySelectorAll('table[style]').forEach((table) => {
		table.removeAttribute('style');
	});

	tempDiv[0].querySelectorAll('td[style]').forEach((td) => {
		td.removeAttribute('style');
	});

	tempDiv = $('<div>').html(tagImg(tempDiv.html()));

	[...tempDiv[0].querySelectorAll('table')].forEach((a) =>
		a.classList.add('data-table'),
	);

	if (!document.getElementById('olBaguncadas').checked) {
		trataOl(tempDiv);
	}

	tempDiv[0].querySelectorAll('ol[type="a"]').forEach((ol) => {
		let letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
		let newHtml = '';

		[...ol.children].forEach((li, index) => {
			let letter = letters[index] || `${index + 1})`;
			newHtml += `<p>${letter}) ${li.innerHTML.trim()}</p>\n`;
		});

		ol.outerHTML = newHtml;
	});

	const titulos = [
		'Exercícios resolvidos',
		'Exercício resolvido',
		'Exercícios de fixação',
		'Exercício de fixação',
		'Pesquisar é descobrir',
		'Hora da leitura',
		'Hora de leitura',
		'Dialogando',
		'Foco na Língua Portuguesa',
		'Você é o autor',
		'Compreensão do texto',
		'Mão na massa',
		'Revise o que você aprendeu',
		'Revise o que aprendeu',
		'Ler e se encantar, é só começar',
		'Ler e encantar, é só começar',
		'Ler e se encantar é só começar',
		'Texto e contexto',
		'Momento pipoca',
		'Sessão pipoca',
		'Saiba mais',
		'Referências',
		'Bibliografia',
		'CNEC virtual',
		'Setting the scene',
		'Speak up!',
		'Reading Time',
		'Activities',
		"Let's review",
		'Did you know?',
		'Popcorn time',
	];

	const tituloMap = new Map();

	function normalizar(texto) {
		return texto
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase();
	}

	titulos.forEach((t) => tituloMap.set(normalizar(t), t));

	tempDiv[0].querySelectorAll('ul > li > b').forEach((b) => {
		const textoLimpo = b.innerHTML
			.replace(/<br\s*\/?>/gi, '')
			.replace(/:$/, '')
			.trim();

		const chaveNormalizada = normalizar(textoLimpo);

		if (tituloMap.has(chaveNormalizada)) {
			const tituloCorreto = tituloMap.get(chaveNormalizada);
			const novoTitulo = `<h5><b>${tituloCorreto}</b></h5>`;

			const li = b.closest('li');
			if (li && li.parentElement.tagName.toLowerCase() === 'ul') {
				li.outerHTML = `<hr>\n${novoTitulo}\n`;
			}
		}
	});

	tempDiv[0].querySelectorAll('ul').forEach((ul) => {
		const filhosValidos = Array.from(ul.childNodes).every(
			(node) =>
				node.nodeType === Node.TEXT_NODE ||
				(node.nodeType === Node.ELEMENT_NODE &&
					['BR', 'HR', 'H5'].includes(node.tagName)),
		);

		if (filhosValidos) {
			while (ul.firstChild) {
				ul.parentNode.insertBefore(ul.firstChild, ul);
			}
			ul.remove();
		}
	});

	tempDiv[0].querySelectorAll('ol[type="1"]').forEach((ol) => {
		let newHtml = '';

		[...ol.children].forEach((li, index) => {
			newHtml += `<br><p><b>${
				index + 1
			})</b> ${li.innerHTML.trim()}</p>\n`;
		});

		ol.outerHTML = newHtml;
	});

	tempDiv[0].querySelectorAll('p').forEach((p) => {
		const bold = p.querySelector('b');

		if (bold) {
			const text = bold.textContent.replace(/\s+/g, ' ').trim();

			if (
				text === 'Resolução comentada' ||
				text === 'Resolução comentada:'
			) {
				const br = document.createElement('br');
				p.parentNode.insertBefore(br, p);
			}
		}
	});

	while (tempDiv[0].querySelector('br + br')) {
		tempDiv[0].querySelectorAll('br + br').forEach((br) => br.remove());
	}

	tempDiv[0].querySelectorAll('b').forEach((b) => {
		const parent = b.parentElement;

		if (!parent) return;

		if (
			!['P', 'DIV', 'LI', 'TD', 'TH', 'H5'].includes(parent.tagName) ||
			(parent.tagName === 'DIV' && !b.parentElement.parentElement)
		) {
			const fragment = document
				.createRange()
				.createContextualFragment(b.innerHTML);
			b.replaceWith(fragment);
		}
	});

	tempDiv[0].querySelectorAll('li').forEach((li) => {
		if (!['UL', 'OL'].includes(li.parentElement?.tagName)) {
			const fragment = document.createDocumentFragment();
			let currentP = null;

			[...li.childNodes].forEach((node) => {
				if (node.nodeType === 1) {
					const tag = node.tagName;

					// Se for um elemento de bloco (bloco fora de <p>)
					if (
						['P', 'UL', 'OL', 'HR', 'H5', 'BR', 'DIV'].includes(tag)
					) {
						// Adiciona o <p> em construção antes
						if (currentP) {
							fragment.appendChild(currentP);
							currentP = null;
						}
						fragment.appendChild(node); // Adiciona o elemento de bloco
					}

					// Se for inline, adiciona ao <p>
					else {
						if (!currentP) currentP = document.createElement('p');
						currentP.appendChild(node);
					}
				} else if (
					node.nodeType === 3 &&
					node.textContent.trim() !== ''
				) {
					if (!currentP) currentP = document.createElement('p');
					currentP.appendChild(
						document.createTextNode(node.textContent),
					);
				}
			});

			// Adiciona o último parágrafo em construção (se existir)
			if (currentP) {
				fragment.appendChild(currentP);
			}

			li.replaceWith(fragment);
		}
	});

	return tempDiv.html();
}

function safeInsertBefore(newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode);
    }
}

function trataOl(tempDiv) {
	// Normaliza <li><p>...</p></li> → <li>...</li>
	tempDiv[0].querySelectorAll('li').forEach((li) => {
		if (li.children.length === 1 && li.children[0].tagName === 'P') {
			li.innerHTML = li.children[0].innerHTML;
		}
	});

	// Converte listas numeradas e alfabéticas
	function processOl(ol, level = '1', start = null) {
		if (!ol) return;

		// Define start
		let count = start || parseInt(ol.getAttribute('start'), 10) || 1;
		let type = ol.getAttribute('type') || level;

		[...ol.children].forEach((li) => {
			// Marca o prefixo (1) ou a) etc.
			let marker = '';
			if (type === '1') {
				marker = `<b>${count})</b>`;
			} else if (type === 'a') {
				marker =
					String.fromCharCode('a'.charCodeAt(0) + (count - 1)) + ')';
			}

			// Cria o parágrafo com o conteúdo
			let p = document.createElement('p');
			p.innerHTML = marker + ' ' + li.innerHTML.trim();
			safeInsertBefore(p, ol);

			// Se tiver sublistas, processa elas depois do <p>
			li.querySelectorAll(':scope > ol').forEach((subOl) => {
				processOl(
					subOl,
					subOl.getAttribute('type'),
					parseInt(subOl.getAttribute('start'), 10),
				);
			});

			count++;
		});

		// Remove o <ol> original
		ol.remove();
	}

	// Processa todas as listas numeradas (inclusive aninhadas)
	tempDiv[0].querySelectorAll("ol[type='1']").forEach((ol) => {
		processOl(ol, '1', parseInt(ol.getAttribute('start'), 10));
	});

	// Processa todas as listas alfabéticas
	tempDiv[0].querySelectorAll("ol[type='a']").forEach((ol) => {
		processOl(ol, 'a', parseInt(ol.getAttribute('start'), 10));
	});
}
