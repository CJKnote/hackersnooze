"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  //check if we are logged in.
  let loggedIn = Boolean(currentUser)

  //filled star or emptu star
  const faved = "fas fa-star";
  const unfaved = "far fa-star";
  let displayStar = "";
  let displayTrash = "";
  //if we are logged in, check if the story is faved and then update the star
  if(loggedIn){
    const storyFav = currentUser.checkIfFav(story);

    (storyFav ? displayStar = faved : displayStar = unfaved);

    const userPosted = currentUser.checkIfUserPosted(story);
    (userPosted ? displayTrash = "Delete" : displayTrash = "");
  }
  
 


  return $(`
      <li id="${story.storyId}">
        <span class = "star">
          <i class = "${displayStar}"></i>
        </span>
        <span class = "trash">
          <i>${displayTrash}</i>
        </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>  
      
      </li>
    `);
}


/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function submitStory(e){
  e.preventDefault();


  const title = $("#submit-title").val();
  const author = $("#submit-author").val();
  const url = $("#submit-url").val();
  const user = currentUser.username;
  const storyData = {title, author, url, user}
  console.log(storyData)

  const story = await storyList.addStory(currentUser, storyData);

  const $addedStory = generateStoryMarkup(story);
  $allStoriesList.prepend($addedStory);

  // hide form after submit
  $storySubmitForm.hide();
  $allStoriesList.show();

  //clear the values 
  $("#submit-title").val("");
  $("#submit-author").val("");
  $("#submit-url").val("");
}

$storySubmitForm.on("submit", submitStory);


//toggle the favorites
async function changeFav(e){
  console.log(e.target);
  const target = $(e.target);
  const line = target.closest("li");
  const clickedStoryId = line.attr("id");
  const clickedStory = storyList.stories.find(s=>s.storyId === clickedStoryId);

  //if it was already faved, remove the favorite
  if(target.hasClass("fas")){
    await currentUser.removeFav(clickedStory);
    line.closest("i").toggleClass("fas far");
  }
  else{
   
    await currentUser.addFav(clickedStory);
    line.closest("i").toggleClass("far fas");
  }


  //update visuals
  putStoriesOnPage();
}

$allStoriesList.on("click", ".star", changeFav)

//edit favorites from the favorites page as well.
async function changeFavFromFav(e){
  console.log(e.target);
  const target = $(e.target);
  const line = target.closest("li");
  const clickedStoryId = line.attr("id");
  const clickedStory = storyList.stories.find(s=>s.storyId === clickedStoryId);

  //if it was already faved, remove the favorite
  if(target.hasClass("fas")){
    await currentUser.removeFav(clickedStory);
    line.closest("i").toggleClass("fas far");
  }
  else{
   
    await currentUser.addFav(clickedStory);
    line.closest("i").toggleClass("far fas");
  }

  //update visuals
  putFavoritesOnPage();
}
$favStoriesList.on("click", ".star", changeFavFromFav)


function putFavoritesOnPage(){
  //clear to allow for updates or user change
  $favStoriesList.empty();

  //loop through the user's favorite list
  for(let fav of currentUser.favorites){
    const favStory = generateStoryMarkup(fav);
    $favStoriesList.append(favStory);
  }
  //unhide it
  $favStoriesList.show();
}

async function handleRemoveStory(e){
  const target = $(e.target);
  const line = target.closest("li");
  const clickedStoryId = line.attr("id");
  const clickedStory = storyList.stories.find(s=>s.storyId === clickedStoryId);

  //if it was already faved, remove the favorite
  await storyList.removeStory(clickedStory, currentUser);

  putStoriesOnPage();
}

$allStoriesList.on("click", ".trash", handleRemoveStory);