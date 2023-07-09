document.getElementById('myForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission
  
    const searchQuery = document.getElementById('search-input').value.trim();
  
    if (searchQuery !== '') {
      fetch('/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ searchQuery })
      })
      .then(response => response.json())
      .then(searchResults => {
        const container = document.getElementById('container');
        container.innerHTML = ''; // Clear previous results
  
        searchResults.forEach(data => {
          const template = document.getElementById('template-section');
          const section = template.content.cloneNode(true);
          section.querySelector('.title').innerHTML = "<h1>"+data.title+"</h1>";
          section.querySelector('.description').innerHTML = "<p>"+data.des+"</p>";
          const imageURL = "https://image.tmdb.org/t/p/w154/"+ data.image;
          section.querySelector('.photo-main').innerHTML = "<img src="+imageURL+"></img>"
          container.appendChild(section);
        });
      });
    }
});
  