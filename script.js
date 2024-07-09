let latestProjectID = 1044366956; // Default value.
let projectHistory = [];

let randId = 0;

function getLatestProjectID() {
  const url = 'https://corsproxy.io/?' + encodeURIComponent('https://api.scratch.mit.edu/explore/projects?limit=1&offset=0&mode=recent&q=*');
  return fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Unable to get the latest project ID.');
      }
    })
    .then(data => {
      if (data && data[0] && data[0].id) {
        latestProjectID = data[0].id - 1; // subtracting the latest ID by 1 is a failsafe.
      }
    })
    .catch(error => {
      console.error('Error fetching latest project ID:', error);
    });
}

document.addEventListener("DOMContentLoaded", function() {
  getLatestProjectID().then(() => {
    console.log('Latest project ID:', latestProjectID);
  });
});

function initProjectFromId(projectId) {
  randId = projectId
  fetch(`https://trampoline.turbowarp.org/proxy/projects/${projectId}`)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Project not found'); // turning this off bc it's annoying
      }
    })
    .then(data => {
      if (data && data.id) {
        projectHistory.push(data)
        document.getElementById("scratch-project").src = `https://turbowarp.org/${projectId}/embed?addons=remove-curved-stage-border,pause,vol-slider,clones`;
        console.log("Loading project:", projectId, data.title)

        document.getElementById("project-link").innerHTML = `<a href="https://scratch.mit.edu/projects/${projectId}" target="_blank">${projectId}</a>`;
        document.getElementById("project-name").textContent = data.title;
        document.getElementById("project-author-text").textContent = data.author.username;
        document.getElementById("project-author-link").href = `https://scratch.mit.edu/users/${data.author.username}`
        document.getElementById("project-author-image").src = data.author.profile.images["90x90"]
        //document.getElementById("project-author-joined").textContent = formatDate(data.author.history.joined) // broken on scratch's end
        //document.getElementById("project-author-st").textContent = data.author.scratchteam
        document.getElementById("project-description").textContent = data.description;
        document.getElementById("project-instructions").textContent = data.instructions;

        document.getElementById("project-created").textContent = formatDate(data.history.created);
        document.getElementById("project-modified").textContent = formatDate(data.history.modified);
        document.getElementById("project-shared").textContent = formatDate(data.history.shared);

        document.getElementById("project-views").textContent = data.stats.views;
        document.getElementById("project-loves").textContent = data.stats.loves;
        document.getElementById("project-favorites").textContent = data.stats.favorites;
        document.getElementById("project-remixes").textContent = data.stats.remixes;

        document.getElementById("project-meta-comments").textContent = data.comments_allowed;

        document.getElementById("loading-screen").style.display = "none";
        //document.getElementById("scratch-project").style.display = "block";

        document.getElementById("project-remixof").innerHTML = `<a href="https://scratch.mit.edu/projects/${data.remix.parent}" target="_blank">${data.remix.parent}</a>`;
        document.getElementById("project-root").innerHTML = `<a href="https://scratch.mit.edu/projects/${data.remix.root}" target="_blank">${data.remix.root}</a>`;

        if (data.remix.root == null) {
          document.getElementById("remix-info-container").style.display = "none";
        } else {
          document.getElementById("remix-info-container").style.display = "block";
        }

        document.getElementById("project-thumbnail-image").src = data.images["282x218"]
      } else {
        setTimeout(tryAgain, 100);
      }
    })
    .catch(error => {
      //console.error(error); // turning this off bc it's annoying
      setTimeout(tryAgain, 100);
    });
}

function getRandomProject() {
  document.getElementById("loading-screen").style.display = "flex";
  //document.getElementById("scratch-project").style.display = "none";

  randId = Math.floor(Math.random() * latestProjectID);

  initProjectFromId(randId)  
}

function tryAgain() {
  document.getElementById("loading-screen").style.display = "flex";
  //document.getElementById("scratch-project").style.display = "none";

  randId += 1;

  initProjectFromId(randId);
}

document.getElementById("find-project-button").addEventListener("click", getRandomProject);

function formatDate(isoDate) {
  const date = new Date(isoDate);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

// window.onpopstate = function(event) {
//   const url = document.getElementById("scratch-project").src
//   const regex = /\/(\d+)\//;
//   const match = url.match(regex)[1];
//   initProjectFromId(match)
// };