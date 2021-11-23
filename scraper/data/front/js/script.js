const form = document.getElementById("scraper-control");
const preview = document.getElementById("preview");
const downloadBtn = document.getElementById("download");

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const downloadlink = document.getElementById("downloadlink")
  if(downloadlink){
    document.body.removeChild(downloadlink);
  }

  preview.classList.remove(... preview.classList)
  const FILENAME = event.target.filename.value;
  const TAGS = event.target.tags.value;
  const RESULT_CONTENT_TYPE = event.target.resulttype.value;
  const SCRAPING_TARGET = event.target.targetcontent.value;

  let t = {
    type: 'text',
    value: ''
  }
  if(SCRAPING_TARGET !== 'text'){
    let val = SCRAPING_TARGET.split('_');
    t = {
      type: val[0],
      value: val[1]
    }
  }
  const obj = {
    file: FILENAME,
    tags: TAGS,
    resultType: RESULT_CONTENT_TYPE,
    target: t
  };
  const data = JSON.stringify(obj);
  console.log(data);


  const contentType = RESULT_CONTENT_TYPE === 'csv' ? 'text/csv' : 'application/json';

  const response = await fetch("http://localhost:3000/",{
    method: "POST",
    headers: {'content-type':'application/json'},
    body: data
  });
  //Create base for download
  let element = document.createElement('a');
  element.id = 'downloadlink';

  if(RESULT_CONTENT_TYPE === 'json') {
    const resJson = await response.json();
    preview.innerText = resJson;
    preview.classList.add('border');
    downloadBtn.classList.remove('hidden');

    filename = `scraper_data.json`
    filetype = 'data:json;charset=utf-8,'

    element.setAttribute('href', filetype + encodeURIComponent(JSON.stringify(resJson)));
    element.setAttribute('download', filename);


    console.log(resJson);
  }
  if(RESULT_CONTENT_TYPE === 'csv'){
   const file = await response;
   const text = await file.text();
   preview.innerText = text.trim();
   preview.classList.add('border');
   downloadBtn.classList.remove('hidden');
   filename = `scraper_data.csv`
   filetype = 'data:csv;charset=utf-8,'
   preview.classList.remove('csv');
   element.setAttribute('href', filetype + encodeURIComponent(text));
   element.setAttribute('download', filename);

   console.log(text);

  }
  element.style.display = 'none';
  document.body.appendChild(element);
  })

  downloadBtn.addEventListener('click', (event) => {
    //Idea from here https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
    const element = document.getElementById("downloadlink")
    element.click();

    document.body.removeChild(element);
    preview.innerText = ""
    preview.classList.remove('border');
    downloadBtn.classList.add('hidden');
  })
