
//start by loading one feature article on the page
    document.addEventListener("DOMContentLoaded", (e) => {
        let featurePage = document.getElementById("feature-article");
        console.log(featurePage);
        featurePage.src = "https://www.indexofsciences.com/good-and-bad-drinks-for-people-with-diabetes/";
    });

/*Function to gather the article json information
async function getArticles() {
    try {
        let response = await fetch("houses.json");
        let data = await response.json();
        return data;
    } catch (err) {
        console.log('There is an error', err);
    }
}
*/

/* function to post the feature article on the page 
function processArticles() {

        let articles = await getArticles();
        let articleLink = "";
        let articleNumber = 0;

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
