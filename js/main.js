
//start by loading one feature article on the page

document.addEventListener("DOMContentLoaded", init);
const featurePage = document.getElementById("feature-article");
let articles=[];
let articleNumber = 1;
const articlesPerPage = 3;

  // create new indexDB database
  var db = new Dexie("HealthNewsDB");

/* check if internet connectivity is present */
setInterval(function(){
    var status = navigator.onLine ? 'You are online!' : 'You are offline!';
    console.log(status);
    console.log();
}, 5000); 
window.addEventListener('offline', function(e) { 
    console.log('offline'); 
});

window.addEventListener('online', function(e) { 
    console.log('online'); 
});

/* set up the page content with the feeds */
function init() {

    // initialize the database schema
    dbInit();
    // Display the initial article feed from db or fetch if db not populated
    db.news.count((dbCount) => {
        if (dbCount > 0) {
            assignArticle(1);
        } else {
            processArticles(1);
        }
    });
    presentFact();
    presentTech();

    /* create shourtcut vars */
    const prevArticle = document.querySelector(".back");
    const nextArticle = document.querySelector(".next");

     /*Detect when user requests to change the article */
     prevArticle.addEventListener("click", changeArticle);
     nextArticle.addEventListener("click", changeArticle);
}

// function to initialize the indexedDB
function dbInit() {
    db.version(1).stores({
        news: "++, &link, title.rendered, content.rendered"
    });
}


//Fun Section: Fetch Random Fact
async function getFact() {
    try {
        let response = await fetch("https://uselessfacts.jsph.pl/random.json?language=en");
        let data = await response.json();
        return data;
    } catch (err) {
        console.log('There is an error', err);
    }
}
async function presentFact() {
    try {
        let randomFact = await getFact();
        fact = randomFact.text;
        const factoid = document.querySelector("#factoid");
        factoid.innerHTML = fact;
    } catch (err) {
        console.log('There is an error', err);
    }
}

//Fun Section: Fetch Techy Talk
async function getTech() {
    try {
        let response = await fetch("https://techy-api.vercel.app/api/json");
        let data = await response.json();
        return data;
    } catch (err) {
        console.log('There is an error', err);
    }
}
async function presentTech() {
    try {
        let randomTech = await getTech();
        techMsg = randomTech.message;
        const techy = document.querySelector("#techy");
        techy.innerHTML = techMsg;
    } catch (err) {
        console.log('There is an error', err);
    }
}

//Function to gather the health article json information
async function getArticles(page) {
    try {
        let api = `https://www.indexofsciences.com/index.php/wp-json/wp/v2/posts?per_page=${articlesPerPage}&page=${page}`;
        console.log('api is', api);
        let response = await fetch(api);
        let data = await response.json();
        return data;
    } catch (err) {
        console.log('There is an error', err);
    }
}

// function to post the feature article on the page 
async function processArticles(page) {
    try {
        let newPage = await getArticles(page);
        console.log('new page is', newPage);

        if (newPage) { 
            articleNumber = await db.news.count()+1;

            // load content into db for backup if lose internet connection
            db.news.bulkPut(newPage);

            console.log('article number is', articleNumber);
            assignArticle(articleNumber);
        } else {
            alert('Cannot get new articles at this time');
        }
    } catch (err) {
        console.log('There is an error', err);
    }
}

async function assignArticle(n){
    const article = await db.news 
        .where(":id").equals(n).first();
    console.log('The article is:', n, article);
    if (navigator.onLine) {
        featurePage.src = article.link;
        console.log('featurePage via link, article no.', n);
    } else {
        document.getElementById('offline-article').innerHTML = ('<h2>'+article.title.rendered+'</h2>'+article.content.rendered);
        featurePage.src = "";
        console.log('featurePage via db, article no.', n, article.title.rendered);
    }
}

async function changeArticle(e) {
    // stop link from trying to reload page
    e.preventDefault();

    // check if we are at the end of the articles collection

    if (e.target.className ==='back') {
        if ((articleNumber === 1)) {
            alert('No more articles');
        } else {
            articleNumber--;
            assignArticle(articleNumber);
        }
    } else {
        console.log('forward, current article no.', articleNumber);
        let dbCount = await db.news.count();
        if (articleNumber === dbCount) {
            page = (Math.floor(dbCount/articlesPerPage) + 1);
            console.log('page number is', page);
            processArticles(page);
        } else {
            articleNumber++;
            assignArticle(articleNumber);
        }
    }
}

//Detect for request to change the article topic search criteria