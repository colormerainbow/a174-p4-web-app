document.addEventListener("DOMContentLoaded", init);

/* create shourtcut global vars */
const featurePage = document.getElementById("feature-article");
const prevArticle = document.querySelector(".back");
const nextArticle = document.querySelector(".next");

var articleNumber = 1;
// set the number of items fetched for each API call, up to max 10 for articles
const articlesPerPage = 3;
const numRecipe = 4;


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
            postRecipe(1);
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

//Detect for request to change the article topic search criteria

/* Nutrition - Meal Planning Section */

//set variables based on user selection
var diet = document.getElementById('diet');
var allergy = document.getElementById('allergy');
var findRecipe = document.getElementById('recipe');

findRecipe.addEventListener('click', processRecipe);

async function getRecipe() {
    var dietType = diet.options[diet.selectedIndex].text;
    console.log('Diet selected:', dietType);

    var exclude = allergy.options[allergy.selectedIndex].text;
    document.getElementById("temp").innerHTML = dietType + exclude;
    console.log('Exclude from recipe:', exclude);

    var dietFilter = "";
    var excludeFilter = "";
    if (dietType) {
        dietFilter=`&diet=${dietType}`;
    }
    if (exclude) {
        excludeFilter = `&intolerances=${exclude}`;
    }
    
    //run the fetch command with user preferences and display recipe options
 
    try {
    //    let menuApi = `https://api.spoonacular.com/recipes/complexSearch?minProtein=20&maxSodium=500&maxSaturatedFat=3&minFiber=8${excludeFilter}${dietFilter}&addRecipeNutrition=true&number=${numRecipe}&apiKey=${myStuff}`;
        let menuApi = `js/menustarter.json`; 
        console.log('menuApi is', menuApi);
        let menuData = await fetch(menuApi);
        console.log('menuData is', menuData);
        let menus = await menuData.json();
        console.log('menus are', menus);

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
        recipedb.recipes.bulkPut(newRecipes);
        console.log('recipes loaded into indexedDB');
        postRecipe(1);

    } catch (err) {
        console.log('There is an error with processArticles', err);
    }
}

async function postRecipe(n) {
   // var rbox2 = document.getElementById('recipe2box');
   const recipeList = document.getElementById('recipeList');
    try {
        recipedb.recipes.each((recipe) => {
            console.log("recipe is", recipe);
            const li = document.createElement("LI");
            var h4 = document.createElement("H4");
            h4.innerHTML = recipe.title;
            console.log(recipe.title,'is the recipe name');
            var image = document.createElement("IMG");
            image.src = recipe.image;
            var rUrl = document.createElement("A");
            rUrl.href = recipe.spoonacularSourceUrl;
            rUrl.innerHTML = "Show Recipe";
            rUrl.classList.add("menubtn");
            recipeList.append(li, h4, rUrl, image);
            });
    
        }catch (err) {
            console.log('There is an error with postRecipe', err);
        };
    }
        /*

                      films.forEach((film) => {
                const li = document.createElement("LI");
                li.textContent = film.title;
                movies_list.append(li);
              });
        console.log('The recipe number is:', n, 'recipeList is ',recipeList);
        document.getElementById('recipe1').innerHTML = recipeList[n-1].title;
        console.log('recipe name is', recipeList[n-1].title);

        document.getElementById('recipe1img').src = recipeList[n-1].image;
        
        if (n < recipeList.length) {
            n++;
            rbox2.classList.remove("hide-all");
            document.getElementById('recipe2').innerHTML = recipeList[n-1].title;
            console.log('2nd recipe name is', recipeList[n-1].title);
        
            document.getElementById('recipe2img').src = recipeList[n-1].image;
        } else {
            rbox2.classList.add("hide-all");
        }
        */

/*
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
}*/



/* regularly check if internet connectivity is present 
setInterval(function(){
    var status = navigator.onLine ? 'You are online!' : 'You are offline!';
    console.log(status);
}, 5000); 
*/