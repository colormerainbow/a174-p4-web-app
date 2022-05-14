document.addEventListener("DOMContentLoaded", init);

/* create shourtcut global vars */
const featurePage = document.getElementById("feature-article");
const prevArticle = document.querySelector(".back");
const nextArticle = document.querySelector(".next");
let articleNumber = 1;
// set the number of ariticles fetched for each API call, up to max 10
const articlesPerPage = 3;

// create new indexedDB database
var db = new Dexie("HealthNewsDB");

/* regularly check if internet connectivity is present 
setInterval(function(){
    var status = navigator.onLine ? 'You are online!' : 'You are offline!';
    console.log(status);
}, 5000); 
*/

//detect if go offline, remove NEXT button if at end of db stored articles
window.addEventListener('offline', function (e) {
    console.log('Now offline');
    db.news.count((dbCount) => {
        if (articleNumber === dbCount) {
            nextArticle.classList.add("hide");
            console.log('article', articleNumber, 'dbCount', dbCount);
            console.log('end of articles stored - remove NEXT button until internet is restored');
        }
    });
});

//detect when back online and allow user to fetch new content
window.addEventListener('online', function (e) {
    console.log('Now online');
    nextArticle.classList.remove("hide");
});

/* set up the page content with the feeds */
function init() {

    // initialize the database schema
    dbInit();
    // Display the initial article feed from db loaded from previous session or fetch if db not populated
    db.news.count((dbCount) => {
        if (dbCount > 0) {
            assignArticle(1);
        } else {
            processArticles(1);
        }
    });
    presentFact();
    presentTech();

    /*Detect when user requests to change the article */
    prevArticle.addEventListener("click", changeArticle);
    nextArticle.addEventListener("click", changeArticle);
}

// function to initialize the indexedDB for health news articles
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
        console.log('There is an error with getFact', err);
    }
}
async function presentFact() {
    try {
        let randomFact = await getFact();
        let fact = randomFact.text;
        const factoid = document.querySelector("#factoid");
        factoid.innerHTML = fact;
    } catch (err) {
        console.log('There is an error with presentFact', err);
    }
}

//Fun Section: Fetch Techy Talk
async function getTech() {
    try {
        let response = await fetch("https://techy-api.vercel.app/api/json");
        let data = await response.json();
        return data;
    } catch (err) {
        console.log('There is an error with getTech', err);
    }
}
async function presentTech() {
    try {
        let randomTech = await getTech();
        let techMsg = randomTech.message;
        const techy = document.querySelector("#techy");
        techy.innerHTML = techMsg;
    } catch (err) {
        console.log('There is an error with presentTech', err);
    }
}

//Function to gather and present the health article json information
async function getArticles(page) {
    try {
        let api = `https://www.indexofsciences.com/index.php/wp-json/wp/v2/posts?per_page=${articlesPerPage}&page=${page}`;
        console.log('api is', api);
        let response = await fetch(api);
        let data = await response.json();
        return data;
    } catch (err) {
        console.log('There is an error with getArticles', err);
    }
}

// function to post the feature article on the page 
async function processArticles(page) {
    try {
        let newPage = await getArticles(page);
        console.log('new page is', newPage);

        if (newPage) {
            articleNumber = await db.news.count() + 1;

            // load or add content into db for backup if lose internet connection
            db.news.bulkPut(newPage);

            console.log('article number on new fetched page is', articleNumber);
            assignArticle(articleNumber);
        } else {
            alert('Cannot get new articles at this time');
        }
    } catch (err) {
        console.log('There is an error with processArticles', err);
    }
}

async function assignArticle(n) {
    const article = await db.news
        .where(":id").equals(n).first();
    //console.log('The article is:', n, article);
    if (navigator.onLine) {
        featurePage.classList.remove('hide-all');
        featurePage.src = article.link;
        //clear any previous offline text
        document.getElementById('offline-article').innerHTML = "";
        console.log('featurePage via url-link, article no.', n, article.title.rendered);
    } else {
        document.getElementById('offline-article').innerHTML = ('<h2>' + article.title.rendered + '</h2>' + article.content.rendered);
        //clear previous displayed article and remove iframe borders
        featurePage.src = "";
        featurePage.classList.add("hide-all");
        console.log('featurePage via db, article no.', n, article.title.rendered);
    }
}

async function changeArticle(e) {
    // stop link from trying to reload page
    e.preventDefault();

    // check if we are at the end of the articles collection and manage UX including in offline mode

    if (e.target.className === 'back') {
        if ((articleNumber === 1)) {
            alert('No more articles');
        } else {
            articleNumber--;
            nextArticle.classList.remove("hide");
            if ((articleNumber === 1)) {
                prevArticle.classList.add("hide");
            }
            assignArticle(articleNumber);
        }
    } else {
        console.log('next article selected');
        prevArticle.classList.remove('hide');
        let dbCount = await db.news.count();
        if (articleNumber === dbCount) {
            if (navigator.onLine) {
                let page = (Math.floor(dbCount / articlesPerPage) + 1);
                console.log('page number is', page);
                processArticles(page);
            } else {
                nextArticle.classList.add("hide");
                console.log('Offline mode, no new fetch, display text only');
            }
        } else {
            articleNumber++;
            if ((articleNumber === dbCount) && (!navigator.onLine)) {
                nextArticle.classList.add("hide");
            }
            assignArticle(articleNumber);
        }
    }
}



//Detect for request to change the article topic search criteria