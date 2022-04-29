
//start by loading one feature article on the page

document.addEventListener("DOMContentLoaded", init);
const featurePage = document.getElementById("feature-article");
let articles=[];
let articleNumber = 0;
const articlesPerPage = 2;

/* set up the page content with the feeds */
function init() {
    // Fetch and display the new article feed
    processArticles(1);
    presentFact();
    presentTech();

    /* create shourtcut vars */
    const prevArticle = document.querySelector(".back");
    const nextArticle = document.querySelector(".next");

     /*Detect when user requests to change the article */
     prevArticle.addEventListener("click", changeArticle);
     nextArticle.addEventListener("click", changeArticle);
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
        console.log(newPage);
        articleNumber = articles.length;
        articles = articles.concat(newPage);
        console.log('articles new page is', articles);

        console.log('array postion is', articleNumber);
        assignArticle(articleNumber);
    } catch (err) {
        console.log('There is an error', err);
    }
}

function assignArticle(n){
    featurePage.src = articles[n].link;
    console.log('featurePage', articleNumber);
}

function changeArticle(e) {
    // stop link from trying to reload page
    e.preventDefault();

    // check if we are at the end of the articles collection

    if (e.target.className ==='back') {
        if ((articleNumber === 0)) {
            alert('No more articles');
        } else {
            articleNumber--;
            assignArticle(articleNumber);
        }
    } else {
        console.log('forward,', articleNumber, articleNumber === (articles.length-1))
        if (articleNumber === (articles.length -1)) {
            page = (Math.floor(articles.length/articlesPerPage) + 1);
            processArticles(page);
        } else {
            articleNumber++;
            assignArticle(articleNumber);
        }
    }
}

//Detect for request to change the article topic search criteria