function addTopicOptionsFromFile(file) {
  fetch(file)
    .then(response => response.text())
    .then(text => {
      const topics = text.split('\n');
      const select = document.querySelector('select');
      topics.forEach(topic => {
        if (topic === '') return;
        const option = document.createElement('option');
        option.textContent = topic;
        select.appendChild(option);
      });
    });
}

addTopicOptionsFromFile('topics.txt');

function setInputValue(id, value) {
  document.getElementById(id).value = value;
}

async function getArxivList() {
  const arxivList = document.getElementById('arxiv-list');
  arxivList.innerHTML = 'Searching...';

  const researchTopic = document.getElementById('research-topic').value;
  const max_results = 5;
  const url = `https://export.arxiv.org/api/query?search_query=all:${researchTopic}&start=0&max_results=${max_results}&sortBy=relevance&sortOrder=descending`;
  const response = await fetch(url);
  const data = await response.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(data, "text/xml");
  const entries = xmlDoc.getElementsByTagName('entry');
  arxivList.innerHTML = '';

  const entriesArray = Array.from(entries);
  entriesArray.sort((a, b) => {
    const dateA = a.getElementsByTagName('published')[0].textContent;
    const dateB = b.getElementsByTagName('published')[0].textContent;
    return dateB.localeCompare(dateA);
  });

  for (let i = 0; i < entriesArray.length; i++) {
    const title = entriesArray[i].getElementsByTagName('title')[0].textContent;
    const titleURI = encodeURIComponent(title);
    const link = entriesArray[i].getElementsByTagName('id')[0].textContent;
    const authorNodeList = entriesArray[i].getElementsByTagName('author');
    const authors = Array.from(authorNodeList).map(a => a.getElementsByTagName('name')[0].textContent).join(', ');
    const summary = entriesArray[i].getElementsByTagName('summary')[0].textContent;
    const summaryURI = encodeURIComponent(summary);
    const date = entriesArray[i].getElementsByTagName('published')[0].textContent.split('T')[0].replace(/-/g, '.');
    const pdf = link.replace('/abs/', '/pdf/');

    arxivList.innerHTML += `<div>
        <h3 class="mt-3"><a href="${link}" target="_blank">${title}</a></h3>
        <p class="my-2"><i>${authors}</i></p>
        <p id="summary" class="my-1">${summary}</p>
        <p class="my-2 text-right"><i>${date}</i></p>
        <div class="my-2 text-right">
          <a href="${pdf}" target="_blank" class="pdf button-link">PDF</a>
          <a href="https://scholar.google.com/scholar?q=${titleURI}" target="_blank" class="google button-link">G</a>
          <a href="https://www.bing.com/translator?from=en&to=ko&text=${summaryURI}" target="_blank" class="translate button-link">한</a>
        </div>
        <hr/>
      </div>`;
  }
}
