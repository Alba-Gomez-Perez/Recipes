# Frontend Code Challenge

Fever's Code Challenge for Front End job applicants

## Fever Pets

Welcome to our awesome project, *Fever Pets! Together*, we are gonna build the best place for our pets to be, so we can show them to the world. Isn't it fantastic?
We are thrilled to start working with you and we would like you to perform a few tasks, but first let us introduce the Fever Pets® project.
Fever Pets will be the main place for our users to see data about pets. What pets you say? Well, ALL pets of course, we don't care about the owners, where those pets are based, or anything. In fact, we don't even have that information!

### What will Fever Pets® do on its first version?

* It will have a home page that will list the pets returned by the list endpoint, with the name of the pet and it's basic traits, as well as the pet's thumbnail. This won't display the description inside the pet structure
* Home page will allow to sort the pets based on the quantifiable criteria: weight, length, height, name, or kind.
* There will be a detail page that will be accessible from the home page, by tapping on the cell/row for a particular pet
* The detail page will display the photo of the pet in a bigger size, and all the data, including the description
* Navigation back and forth between detail and home should be possible
* If any kind of sorting is applied, and detail is opened, navigating to home should preserve this order.
* There should be a button that gives us the "pet of the day" in the home page. For every calendar day there should be a favourite pet. The pet should not change during the navigation and will remain the same for the whole day. 
    * Example: If the user clicks on the 'pet of the day button' at 3 pm the favourite pet is 'Bingo', and if the user clicks on the 'pet of the day button' at 8 pm the pet should still be 'Bingo'

That's basically our glorious Fever Pets® v1.0, and I'm sure you are already thrilled to start dealing with it!
In order for us to be able to see the progress, and give you feedback, we would ask for it to be done by making several PRs to the project, doing each PR after the previous one has been approved and merged:
* PR #1: Create the project basic structure, this is just the skeleton of the project for whichever framework you have chosen to use (Angular, Vue, or whichever you fancy using). This PR should not contain any logic related to Fever Pets®
* After that, create as many pull requests as you want for the desired features. As we cannot review the PRs on time, just merge them to development or master and continue your code test, no need to wait for us. Every decision made during the development, should be written either on the body of the pull request or on the README.md



### Technical details

In order to have Fever pets working, we already had our backend team working, and they are offering two endpoints you can consume:

* `https://my-json-server.typicode.com/Feverup/fever_pets_data/pets` To fetch the list of pets on the server
* `https://my-json-server.typicode.com/Feverup/fever_pets_data/pets/<pet_id>` To fetch the details about a particular pet with id <pet_id>
* Here you have some interesting links about the API:
    * [Pagination](https://github.com/typicode/json-server#paginate)
    * [Sorting](https://github.com/typicode/json-server#sort)
    * [Filtering](https://github.com/typicode/json-server#filter)


The details endpoint will return a Pet object, with the following structure:
* `id` Int the pet's unique id
* `name` String The pet's name
* `kind` String The pet's kind (dog or cat on the first version)
* `weight` Int The pet's weight, in grams
* `height` Int The pet's height in centimeters
* `length` Int The pet's length, in centimeters
* `photo_url` String The pet's picture url
* `description` String A small text about the pet
* `number_of_lives` Int between 1 and 7, only for Cats
* ...and more in the future

The pets have a `health` assigned, `weight / (height * length)`. The health has three tiers:
* `unhealthy` below 2 or over 5
* `healthy` between 3 and 5
* `very healthy` between 2 and 3
* If the pet is a cat and the number of lives is 1, the pet is always `unhealthy`
* Take into account that more pets are coming and they could have different health calculations

### Considerations

* More pets and pets' type can be added in the future
* We could have millions of pets registered in the near future and we need to take into account performance
* Fever Pets can have users in different countries
