let checkLocalStorage = function() {
    if (localStorage.getItem("nqeStoryOrder") == null) {
        localStorage.setItem("nqeStoryOrder", "{}")
        return true
    } else {
        let storyOrder = JSON.parse(localStorage.getItem("nqeStoryOrder"))
        let storyIcons = Array.from(document.querySelectorAll("[data-nqe-story-icon]"))
        if (storyIcons.length !== Object.keys(storyOrder).length) {    
            for (let id in storyOrder) {
                let icon = document.querySelector(`[data-nqe-story-icon="${id}"]`)
                icon.classList.add("story-viewed")
                icon.style.order = storyOrder[id]
            }
        } else {
            localStorage.setItem("nqeStoryOrder", "{}")
            storyIcons.forEach(function(icon){  
                icon.removeAttribute("data-story-viewed")
            })
        }
    }
}

checkLocalStorage()


// Used for each story icon which will trigger the story container to show //
let storyButtons = Array.from(document.querySelectorAll("[data-nqe-story-icon]"))
storyButtons.forEach(function (storyButton) {
    storyButton.addEventListener("click", function(e){
        let id = this.getAttribute("data-nqe-story-icon")
        let storyContainer = document.querySelector(`[data-nqe-story-id="${id}"]`)
        if (storyContainer != undefined) {
            storyContainer.classList.remove("hidden")
            storyContainer.classList.add("nql-show-fast")
            if (storyButton.getAttribute("data-story-viewed") != "true") {
                storyButton.setAttribute("data-story-viewed", "true")
                startStoryForm(storyContainer)
            } else {
                startStoryForm(storyContainer, "viewed")
            }
        }
    })
 })


// Used to auto play the next story icon //
 let autoStory = function(container) {
    let id = container.getAttribute("data-nqe-story-id")
    let currentIcon = document.querySelector(`[data-nqe-story-icon="${id}"]`)
    let nextIcon = currentIcon.nextElementSibling
    if (nextIcon != undefined && nextIcon.getAttribute("data-story-viewed") != "true" ) {
        nextIcon.click()
    } else {
        let allIcons = Array.from(currentIcon.parentNode.querySelectorAll("[data-nqe-story-icon]:not([data-story-viewed='true'])"))  
        if (allIcons != undefined && allIcons.length > 0) {
            for (let i = 0; i <= allIcons.length; i++) {
                if (allIcons[i].getAttribute("data-story-viewed") != "true" ) {
                    allIcons[i].click()
                    break; 
                }
              }
        }
    }
 }

 let values = {
    foundHeight : {},
    foundWidth: {}
} 
let active
let interval
let heights = []
let widths = []
let resetValue
let iconCounter = 0

let startStoryForm = function(storyContainer, status, autoplay = "true") {
    let container = storyContainer.querySelector("[data-nqe-story-container]")
    let allCards = Array.from(container.querySelectorAll("[data-card-order]"))
    let items = allCards.length
    let startPauseButtonContainer = storyContainer.querySelector("[data-nqc-button-container]")
    let buttons = Array.from(container.querySelectorAll("[data-nqe-story-button]"))
    let progressBarContainer = storyContainer.querySelector("[data-nqe-progress-container]")
    let progressBars = Array.from(progressBarContainer.querySelectorAll("[data-progess-order]"))

    let buttonCounter = 0


    active = true
    interval = setInterval(() => { startAutoPlay()},100);

    let startAutoPlay = () => {
        let currentCard = container.querySelector(".mainImage")
        let video = currentCard.querySelector("video")
        let currentBarOriginalID = currentCard.getAttribute("data-original-order")
        let currentProgressBar = progressBarContainer.querySelector(`[data-progess-order="${currentBarOriginalID}"]`)
        let time = parseInt(currentCard.getAttribute('data-nqe-story-time'));
        if (video != undefined)  {
            video.play();
        }
        if (time != null) {
            let remaining  = parseInt(currentCard.getAttribute('data-remaining-time'));
            remaining += 100;
            currentCard.setAttribute('data-remaining-time',remaining);
            currentProgressBar.querySelector('div').style.width = (remaining/time)*100 + "%";
            if (remaining >= time){
                autoClick("next")
            }
        }
    }
    // Auto Play Functions //
    let autoClick = (direction) => {
        let currentButton
        let currentCard = container.querySelector(".mainImage")
        if (direction == "next") {
            currentButton = currentCard.querySelector('[data-nqe-story-button="next"]')
        } else {
            currentButton = currentCard.querySelector('[data-nqe-story-button="prev"]')
        }
        currentButton.click()
        if (currentCard.nextElementSibling != null) {
            startAutoPlay()
        }
    }

    // Using for test purposes //

  
    let contentEqualizer = function() {

        allCards.forEach(function(card){
           heights.push(Math.floor(card.getBoundingClientRect().height * 100 ) / 100)
           widths.push(Math.round(card.getBoundingClientRect().width * 100 ) / 100)
        })
        heights.forEach(function (height) {
            values.foundHeight[height] = (values.foundHeight[height] || 0) + 1;
         })
         widths.forEach(function (width) {
            values.foundWidth[width] = (values.foundWidth[width] || 0) + 1;
         })

         let hightestComparedHeightValue = 0
         let hightestComparedWidthValue = 0
         let newHeight
         let newWidth

         for (let height in values.foundHeight) {
            if (values.foundHeight[height] > hightestComparedHeightValue) {
                hightestComparedHeightValue = values.foundHeight[height]
                newHeight = height
            }
          }

          for (let width in values.foundWidth) {
            if (values.foundWidth[width] > hightestComparedWidthValue) {
                hightestComparedWidthValue = values.foundWidth[width]
                newWidth = width
            }
          }

          allCards.forEach(function(card){
            card.style.height = `${parseInt(newHeight)}px`
            card.style.width = `${parseInt(newWidth)}px`
         })

    }

    contentEqualizer()

    let transformContainer = () => {
        let firstCard = container.querySelector("[data-nqe-locate]")
        let bottomLocate = storyContainer.querySelector("[data-nqe-bottom-locate]")
        let cardWidth = firstCard.getBoundingClientRect().width
        let pageWidth = bottomLocate.getBoundingClientRect().width
        let translate = (50 - (100 - (((pageWidth - (cardWidth / 2)) / pageWidth) * 100)))

        if(window.matchMedia("(min-width: 767px)").matches == true) {
            container.style.transform  = `translateX(${translate}%)`
        } else {
            container.style.transform  = `unset`
        }
    }

    transformContainer()

    // Due not rebind any events that affect buttons or cards //

    if (status != "viewed") {
        // Reset Function which will return everything back to the orignal position //
        let reset = () => {
            clearInterval(interval)
            buttonCounter = 0
            active = true
            heights = []
            widths = []
            values = {
                foundHeight : {},
                foundWidth: {}
            }

            allCards.forEach(function(card){
                card.style.transform  = `unset`
                let originalOrder = card.getAttribute("data-original-order")
                card.setAttribute("data-remaining-time", "0")
                card.setAttribute("data-card-order", `${originalOrder}`)
                card.classList.remove("mainImage","prevImage","nextImage")
                originalOrder == "0"? card.classList.add("mainImage") : card.classList.add("nextImage")
            })
            progressBars.forEach(function(bar){
                bar.querySelector('div').style.width = (0)*100 + "%";
            })
        }

        // Used to update the card order and progress bar when the next or previous buttons are clicked //

        let updateCardOrder = function(card, direction, progressBar) {
            let progressBarValue
            direction == "next" ? progressBarValue = 1 : progressBarValue = 0;
            card.classList.remove("mainImage")
            card.classList.remove("z-10")
            card.setAttribute('data-remaining-time',"0");
            progressBar.querySelector('div').style.width = (progressBarValue)*100 + "%";
            clearInterval(interval);
            interval = setInterval(() => { startAutoPlay()},100);
            active = true;

        }

        // Function that is used when the next or previous buttons are clicked //

        let updateOrder = function(count, direction) {
        transitionValue = ((count * 100 ))
            allCards.forEach(function(card){
                let video = card.querySelector("video")
                let order = parseInt(card.getAttribute("data-card-order"))
                if (direction == "next") {
                    order = (order - 1)
                    card.setAttribute("data-card-order", `${order.toString()}`)
                } else {
                    order = (order + 1)
                    card.setAttribute("data-card-order", `${order.toString()}`)
                }
                
                if (order == 0) {
                    if (video != undefined) {video.play()}
                    card.classList.add("mainImage")
                    card.classList.add("z-10")
                    if(window.matchMedia("(min-width: 768px)").matches == true) {
                        card.style.transform  = `translateX(-${transitionValue}%)`
                    }
                } else if (order < 0) {
                    card.classList.add("prevImage")
                    if(window.matchMedia("(min-width: 768px)").matches == true) {
                        card.style.transform  = `translateX(-${transitionValue}%)`
                    }
                } else {
                    card.classList.add("nextImage")
                    if(window.matchMedia("(min-width: 768px)").matches == true) {
                        card.style.transform  = `translateX(-${transitionValue}%)`
                    }
                }
            })
        }

        // ****All BIND EVENTs****** //

            buttons.forEach(function(button){
                let direction = button.getAttribute("data-nqe-story-button")
                let currentStoryID = storyContainer.getAttribute("data-nqe-story-id")
                button.addEventListener("click", function(e) {
                    let currentCard = this.closest("[data-card-order]")
                    let currentBarOriginalID = currentCard.getAttribute("data-original-order")
                    let currentProgressBar = progressBarContainer.querySelector(`[data-progess-order="${currentBarOriginalID}"]`)
                    let currentIcon = document.querySelector(`[data-nqe-story-icon="${currentStoryID}"]`)
                    let video = currentCard.querySelector("video")
                    if (direction == "next" && !(buttonCounter >= items -1 )) {
                        buttonCounter += 1
                        if (video != undefined)  {
                            video.currentTime = 0;
                            video.pause();
                        }
                        updateCardOrder(currentCard, direction, currentProgressBar)
                        updateOrder(buttonCounter, "next")
                    } else if (direction == "prev" && buttonCounter != 0) {
                        buttonCounter -= 1
                        if (video != undefined)  {
                            video.currentTime = 0;
                            video.pause();
                        }
                        updateCardOrder(currentCard, direction, currentProgressBar)
                        updateOrder(buttonCounter, "prev")
                    } else if (direction == "prev" && buttonCounter == 0) {
                        if (video != undefined)  {
                            video.currentTime = 0;
                            video.play();
                        }
                        currentCard.setAttribute('data-remaining-time',"0");
                        currentProgressBar.querySelector('div').style.width = (0)*100 + "%";
                        clearInterval(interval);
                        interval = setInterval(() => { startAutoPlay()},100);
                        active = true;
                    } else {
                        let newOrder = 100 + iconCounter
                        currentIcon.style.order = `${newOrder.toString()}`
                        currentIcon.classList.add("story-viewed")
                        let orderObject = JSON.parse(localStorage.getItem("nqeStoryOrder"))
                        orderObject[`${currentStoryID.toString()}`] = `${newOrder.toString()}`
                        localStorage.setItem("nqeStoryOrder", JSON.stringify(orderObject))
                        iconCounter += 1
                        reset()
                        autoStory(storyContainer)
                        storyContainer.classList.add("hidden")
                        storyContainer.classList.remove("nql-show-fast")

                    }
                })
            })

            // Play Button & Pause & Exit //

            // Working //
            let playButton = storyContainer.querySelector("[data-nqe-playButton]")
            playButton.addEventListener("click", function(){
                let currentCard = container.querySelector(".mainImage")
                let video = currentCard.querySelector("video") 
                if (video != undefined)  {video.play()}
                startPauseButtonContainer.classList.add("pause")
                clearInterval(interval)
                interval = setInterval(() => { startAutoPlay()},100);
                active = true;
            })
            // Working //
            let pauseButton = storyContainer.querySelector("[data-nqe-pauseButton]")
            pauseButton.addEventListener("click", function(){
                let currentCard = container.querySelector(".mainImage")
                let video = currentCard.querySelector("video")
                if (video != undefined)  {video.pause()}
                startPauseButtonContainer.classList.remove("pause")
                clearInterval(interval)
                active = false;
            })
            // Working //
            let exitButton = storyContainer.querySelector("[data-nqe-exitButton]")
            exitButton.addEventListener("click", function(){
                let currentCard = container.querySelector(".mainImage")
                let video = currentCard.querySelector("video")
                if (video != undefined)  {
                    video.currentTime = 0;
                    video.pause();
                }
                reset()
                storyContainer.classList.add("hidden")
                storyContainer.classList.remove("nql-show-fast")
            })

            // Pause and Play on card //

            allCards.forEach(function(currentCard){

                if (('ontouchstart' in window)) {
                
                    currentCard.addEventListener("touchstart", (e) => {
                        if (currentCard.classList.contains("mainImage")) {
                            let video = currentCard.querySelector("video")
                            if (active){
                                if (video != undefined)  {video.pause()}
                                startPauseButtonContainer.classList.remove("pause")
                                clearInterval(interval);
                                active = false;
                            }
                        }           
                    });
                    
                    currentCard.addEventListener("touchend", (e) => {
                        if (currentCard.classList.contains("mainImage")) {
                            let video = currentCard.querySelector("video")
                            let product = currentCard.querySelector('[data-nqe-card-type="product"], [data-nqe-card-type="content"]')
                            if (active == false){
                                if (video != undefined)  {video.play()}
                                if (product != undefined)  {

                                } else {
                                startPauseButtonContainer.classList.add("pause")
                                clearInterval(interval);
                                interval = setInterval(() => { startAutoPlay()},100);
                                active = true;
                                }
                            }
                        } 
                    });

                    let touchStartY;
                    let touchEndY;
                    let touchStartX;
                    let touchEndX;
                    
                    function handleTouchStart(e) {
                        touchStartY = e.changedTouches[0].clientY;
                        touchStartX = e.changedTouches[0].clientX;
                    }
                    
                    function handleTouchEnd(e) {
                        touchEndY = e.changedTouches[0].clientY;
                        touchEndX = e.changedTouches[0].clientX;
                        handleSwipeGesture();
                    }
                    
                    function handleSwipeGesture() {
                        let diffY = touchStartY - touchEndY;
                        let diffX = touchStartX - touchEndX;
                    
                        if (Math.abs(diffX) > Math.abs(diffY)) {
                            // Horizontal swipe detected
                            diffX > 0 ? autoClick("next") : autoClick("prev")
                        } else {
                            // Vertical swipe detected
                            if (diffY > 0) {
                                let video = currentCard.querySelector("video")
                                if (video != undefined)  {
                                    video.currentTime = 0;
                                    video.pause();
                                }
                                reset()
                                storyContainer.classList.add("hidden")
                                storyContainer.classList.remove("nql-show-fast")
                            }
                        }
                    }
                    currentCard.addEventListener('touchstart', handleTouchStart, false);        
                    currentCard.addEventListener('touchend', handleTouchEnd, false);

                } else {

                    currentCard.addEventListener('click',(e) => {
                        if (currentCard.classList.contains("mainImage")) {
                            let video = currentCard.querySelector("video")
                            let product = currentCard.querySelector('[data-nqe-card-type="product"], [data-nqe-card-type="content"]')
                            if (active){
                                if (video != undefined)  {video.pause()}
                                startPauseButtonContainer.classList.remove("pause")
                                clearInterval(interval);
                                active = false;
                            } else {
                                if (video != undefined)  {video.play()}
                                if (product != undefined)  {

                                } else {
                                startPauseButtonContainer.classList.add("pause")
                                clearInterval(interval);
                                interval = setInterval(() => { startAutoPlay()},100);
                                active = true;
                                }
                            }
                        }
                    });
                }            
            })

            window.addEventListener("resize", function() {
                reset()
                storyContainer.classList.add("hidden")
                storyContainer.classList.remove("nql-show-fast")
            })
    }
}




