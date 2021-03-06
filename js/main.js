document.addEventListener("DOMContentLoaded", init);

/* create shourtcut global vars */
const featurePage = document.getElementById("feature-article");
const prevArticle = document.querySelector(".back");
const nextArticle = document.querySelector(".next");
const recipeList = document.getElementById('recipeList');
const infobtn = document.getElementById('infobtn');

var articleNumber = 1;
// set the number of items fetched for each API call, up to max 10 for articles
const articlesPerPage = 3;
const numRecipe = 6;


// create new indexedDB databases
var db = new Dexie("HealthNewsDB");
var recipedb = new Dexie("RecipesDB");

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

/* set up the initial page content */
function init() {

    // initialize the database schema for health articles
    dbInit();
    // Display the initial article feed from db loaded from previous session or fetch if db not populated
    db.news.count((dbCount) => {
        if (dbCount > 0) {
            assignArticle(1);
        } else {
            processArticles(1);
        }
    });

    // initialize the database schema for recipes
    recipedbInit();
    // Initially display the recipes from db loaded from previous session or fetch if db not populated
    recipedb.recipes.count((recipedbCount) => {
        if (recipedbCount > 0) {
            postRecipe();
        } else {
            processRecipe();
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
// function to initialize the indexedDB for recipes
function recipedbInit() {
    recipedb.version(1).stores({
        recipes: "++, &id, title, sourceUrl, image, nutrition.nutrients, spoonacularSourceUrl"
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

//Function to fetch the health article json information
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

// overall function to process a feature article 
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

//future: Detect for request to change the article topic search criteria

/* Nutrition - Meal Planning Section */

//set variables based on user selection
var diet = document.getElementById('diet');
var allergy = document.getElementById('allergy');
var findRecipe = document.getElementById('recipe');

// Listen for user's request for new recipes
findRecipe.addEventListener('click', processRecipe);
// Listen for a click on the info button to provide info
infobtn.addEventListener("click", infoPage);

function infoPage() {
    window.open('https://spoonacular.com/academy/which-diet-is-best-for-me', '_blank');
}

async function getRecipe() {
    //get the user preferences for diet and intolerances
    var dietType = diet.options[diet.selectedIndex].text;
    var exclude = allergy.options[allergy.selectedIndex].text;
    var spec = [];
    if (dietType) spec.push(dietType);
    if (exclude) spec.push(`NO ${exclude}`);

    //confirm to the user that inputs are taken for the search
    document.getElementById("choices").innerHTML = spec.join(" and ");
    console.log('Diet selected:', dietType);
    console.log('Exclude from recipe:', exclude);

    //set up the query string parameters with user selections
    var dietFilter = "";
    var excludeFilter = "";
    if (dietType) {
        dietFilter = `&diet=${dietType}`;
    }
    if (exclude) {
        excludeFilter = `&intolerances=${exclude}`;
    }

    //run the fetch command with user preferences and display recipe options

    try {
        let menuApi = `https://api.spoonacular.com/recipes/complexSearch?minProtein=20&maxSodium=500&maxSaturatedFat=3&minFiber=8${excludeFilter}${dietFilter}&addRecipeNutrition=true&number=${numRecipe}&apiKey=${myStuff}`;
        console.log('fetchAPI dietfilter', dietFilter, 'exclude:', excludeFilter);
        //   let menuApi = `js/menustarter.json`; 
        console.log('menuApi used is', menuApi);
        let menuData = await fetch(menuApi);
        let menus = await menuData.json();

        const menuArray = menus.results;
        console.log('api data fetched is:', menuArray);
        return menuArray;
    } catch (err) {
        console.log('There is an error with getRecipe', err);
    }

}

async function processRecipe() {
    try {
        let newRecipes = await getRecipe();
        console.log('new recipes are', newRecipes);

        // load or add content into db for backup if lose internet connection
        if (newRecipes) {
            await recipedb.recipes.clear();
            console.log('indexdb cleared!!');
            await recipedb.recipes.bulkPut(newRecipes);
            console.log('new recipes loaded into indexedDB');
        } else {
            console.log('something wrong with newRecipes', newRecipes);
        }
        postRecipe();

    } catch (err) {
        console.log('There is an error with processArticles', err);
    }
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

async function postRecipe() {
    //first clear the display area of old recipes
    removeAllChildNodes(recipeList);
    try {
        recipedb.recipes.each((recipe) => {
            console.log("postrecipe is", recipe);
            const li = document.createElement("LI");
            var h4 = document.createElement("H4");
            h4.innerHTML = recipe.title;
            console.log(recipe.title, 'is the recipe name');
            var image = document.createElement("IMG");
            image.src = recipe.image;
            image.classList.add('recipe-img');
            let rUrl = document.createElement("A");
            rUrl.href = recipe.spoonacularSourceUrl;
            rUrl.innerHTML = "See Recipe";
            rUrl.classList.add("menubtn");
            rUrl.setAttribute('target', '_blank');
            li.classList.add('singleRecipe');
            li.appendChild(h4);
            li.appendChild(rUrl);
            li.appendChild(image);
            recipeList.appendChild(li);
            console.log('added to html via js at recipeList', recipeList);
        });

    } catch (err) {
        console.log('There is an error with postRecipe', err);
    }
}