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
    }
 }



let active
let interval

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
                autoClick()
            }
        }
    }
    // Auto Play Functions //
    let autoClick = () => {
        let currentCard = container.querySelector(".mainImage")
        let currentButton = currentCard.querySelector('[data-nqe-story-button="next"]')
        currentButton.click()
        if (currentCard.nextElementSibling != null) {
            startAutoPlay()
        }
    }

    // Using for test purposes //

    let contentEqualizer = function() {
        let heights = []
        let widths = []
        let values = {
            foundHeight : {},
            foundWidth: {}
        }
        allCards.forEach(function(card){
           heights.push(card.getBoundingClientRect().height)
           widths.push(card.getBoundingClientRect().width)
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
                button.addEventListener("click", function(e) {
                    let currentCard = this.closest("[data-card-order]")
                    let currentBarOriginalID = currentCard.getAttribute("data-original-order")
                    let currentProgressBar = progressBarContainer.querySelector(`[data-progess-order="${currentBarOriginalID}"]`)
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
                        clearInterval(interval)
                    } else {
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
                startPauseButtonContainer.classList.add("pause")
                interval = setInterval(() => { startAutoPlay()},100);
                active = true;
            })
            // Working //
            let pauseButton = storyContainer.querySelector("[data-nqe-pauseButton]")
            pauseButton.addEventListener("click", function(){
                startPauseButtonContainer.classList.remove("pause")
                clearInterval(interval)
                active = false;
            })
            // Working //
            let exitButton = storyContainer.querySelector("[data-nqe-exitButton]")
            exitButton.addEventListener("click", function(){
                reset()
                storyContainer.classList.add("hidden")
                storyContainer.classList.remove("nql-show-fast")
            })

            // Pause and Play on card //

            allCards.forEach(function(currentCard){

                if (window.matchMedia("(min-width: 768px)").matches == true) {
                    currentCard.addEventListener('click',(e) => {
                        if (currentCard.classList.contains("mainImage")) {
                            let video = currentCard.querySelector("video")
                            if (active){
                                if (video != undefined)  {video.pause()}
                                startPauseButtonContainer.classList.remove("pause")
                                clearInterval(interval);
                                active = false;
                            } else {
                                if (video != undefined)  {video.play()}
                                startPauseButtonContainer.classList.add("pause")
                                interval = setInterval(() => { startAutoPlay()},100);
                                active=true;
                            }
                        }
                    })
                }

                if (window.matchMedia("(max-width: 767px)").matches == true) {
                
                    currentCard.addEventListener("touchstart", (event) => {
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
                    
                    currentCard.addEventListener("touchend", (event) => {
                        if (currentCard.classList.contains("mainImage")) {
                            let video = currentCard.querySelector("video")
                            if (active == false){
                                if (video != undefined)  {video.play()}
                                startPauseButtonContainer.classList.add("pause")
                                interval = setInterval(() => { startAutoPlay()},100);
                                active = true;
                            }
                        } 
                    });

                }

                // HoverState, Drag, TouchStart, //

               // currentCard.addEventListener("mouseover", function(){
               //     //clearInterval(nextInterval)
               //     //console.log("Interval Canceled")
               // })
               // currentCard.addEventListener("mouseout", function(e){
               //     let currentCard = e.target.closest("[data-nqe-story-time]")
               //     let currentCardTimer = currentCard.getAttribute("data-nqe-story-time")
               //     //startAutoPlay("true", currentCardTimer)
               //     //console.log("Interval Started")
               // })
            
            
            })

            window.addEventListener("resize", function() {
                reset()
                storyContainer.classList.add("hidden")
                storyContainer.classList.remove("nql-show-fast")
            })
    }
}




