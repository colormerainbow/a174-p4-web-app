ARTDM174 Lab8 Assignment

Demonstrates the use of indexedDB with Dexie to save fetched health articles into a local DB and displays the content as a web page (via URL) when there is internet connectivity. During a session, if the internet connection drops, the page will still allow the user to see the main content (without images) of the articles for a smooth user experience. 


API Sources:

I. General info:
https://www.programmableweb.com/api/index-sciences-rest-api-v10
https://www.indexofsciences.com/about-us/

general posting:
    https://www.indexofsciences.com/index.php/wp-json/wp/v2/posts
page and specific topic:
see under content.rendered for the full page code
    https://www.indexofsciences.com/index.php/wp-json/wp/v2/posts?page=1&search=diabetes
    https://www.indexofsciences.com/index.php/wp-json/wp/v2/posts?page=1&per_page=5&search=diabetes

documentation:
    https://www.indexofsciences.com/wp-json/wp/v2

feature articles:
    https://www.indexofsciences.com/13-ways-for-preventing-type-2-diabetes/

    https://www.indexofsciences.com/good-and-bad-drinks-for-people-with-diabetes/



II. General Info:
https://www.programmableweb.com/api/food-rest-api-v10
https://www.programmableweb.com/api/food-rest-api-v10
https://spoonacular.com/food-api
https://spoonacular.com/food-api/docs#Quotas
https://spoonacular.com/food-api/docs
Look at the endpoints for Meal Planning

search recipes by ingredients:
documentation:
    https://spoonacular.com/food-api/docs#Search-Recipes-by-Ingredients

    fetch ("https://api.spoonacular.com/recipes/findByIngredients")

https://api.spoonacular.com/food/products/search?query=yogurt&apiKey=API-KEY

III. Fun APIs
Random Useless Facts:
https://uselessfacts.jsph.pl/
    https://uselessfacts.jsph.pl/random.json?language=en

Techy Phrases:
    https://techy-api.vercel.app/api/json

Magic-8 ball
    https://magic-8ball.com/
    embedded code:
    <iframe id="magic-8ball" style="width:100%;border:none;overflow:hidden;min-height:515px" src="https://magic-8ball.com/?embed_widget" scrolling="no"></iframe>

    Random Number APIs
    https://csrng.net/csrng/csrng.php?min=0&max=100

    http://www.randomnumberapi.com/api/v1.0/random?min=1&max=100&count=5
