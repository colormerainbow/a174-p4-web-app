
//start by loading one feature article on the page

const featurePage = document.getElementById("feature-article");
document.addEventListener("DOMContentLoaded", (e) => {
        featurePage.src = "https://www.indexofsciences.com/13-ways-for-preventing-type-2-diabetes/";
    });

//Fun Section: Random Fact
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
        console.log(fact);
        const factoid = document.querySelector("#factoid");
        factoid.innerHTML = fact;
    } catch (err) {
        console.log('There is an error', err);
    }
}

//Fun Section: Techy Talk
async function getTech() {
    try {
        let response = await fetch(" https://techy-api.vercel.app/api/json");
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
        console.log(techMsg);
        const techy = document.querySelector("#techy");
        techy.innerHTML = techMsg;
    } catch (err) {
        console.log('There is an error', err);
    }
}

presentFact();
presentTech();



// Fetch and display the new article feed

const articles="";
const articleLink = "";
const articleNumber = 0;
/*
processArticles(articles);
console.log('articles json:', articles);
articleLink = articles[articleNumber].link;
console.log('new url', articleLink)
featurePage.src = articleLink;
*/
/*
//Function to gather the article json information
async function getArticles() {
    try {
        let response = await fetch("https://www.indexofsciences.com/index.php/wp-json/wp/v2/posts");
        let data = await response.json();
        return data;
    } catch (err) {
        console.log('There is an error', err);
    }
}

// function to post the feature article on the page 
async function processArticles(articles) {
    try {
        articles = await getArticles();
        console.log('articles json:', articles);
        articleLink = articles[articleNumber].link;
        console.log('new url', articleLink);
        featurePage.src = articleLink;
    } catch (err) {
        console.log('There is an error', err);
    }
}
*/
    //    let articleLink = "";
    //    let articleNumber = 0;
/*
        houses.forEach((house) => {
            let objInfo = `<dt class="house">${house.name}</dt>`;
            house.members.forEach((member) => {
                objInfo += `<dd class="folks">${member}</dd>`;
            });

            // generate the html snippet for one array item and add to the "html" temp holder.
            html += objInfo;
        });
        //close the html with the closing tag
        html += `</dl>`;

        //make a reference to the html container where
        //the info will be displayed.
        const container = document.querySelector("#container");
        container.innerHTML = html;
    } 
    //catch (err) {console.log('There is an error', err)};
     //  processArticles(0);
    */



//Detect for request to change the article search criteria