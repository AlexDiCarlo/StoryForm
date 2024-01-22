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
    if (!container) {
        console.error('No container provided');
        return;
    }

    let id = container.getAttribute("data-nqe-story-id");
    if (!id) {
        console.error('No data-nqe-story-id attribute found on container');
        return;
    }

    let currentIcon = document.querySelector(`[data-nqe-story-icon="${id}"]`);
    if (!currentIcon) {
        console.error(`No icon found with data-nqe-story-icon="${id}"`);
        return;
    }

    let nextIcon = currentIcon.nextElementSibling;
    if (nextIcon && nextIcon.getAttribute("data-story-viewed") !== "true") {
        nextIcon.click();
    }
};

let active
let interval
let heights = []
let widths = []
let values = {
    foundHeight : {},
    foundWidth: {}
}
let resetValue

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
        let currentCard = container.querySelector(".mainImage");
    
        if (!currentCard) {
            console.error('No main image found in container');
            return;
        }
    
        let video = currentCard.querySelector("video");
        let currentBarOriginalID = currentCard.getAttribute("data-original-order");
        let currentProgressBar = progressBarContainer.querySelector(`[data-progess-order="${currentBarOriginalID}"]`);
    
        if (!currentProgressBar) {
            console.error('No matching progress bar found');
            return;
        }
    
        let time = parseInt(currentCard.getAttribute('data-nqe-story-time'), 10);
    
        if (video) {
            video.play();
        }
    
        if (!isNaN(time)) {
            let remaining  = parseInt(currentCard.getAttribute('data-remaining-time'), 10) || 0;
            remaining += 100;
            currentCard.setAttribute('data-remaining-time', remaining.toString());
            currentProgressBar.querySelector('div').style.width = `${(remaining / time) * 100}%`;
    
            if (remaining >= time) {
                autoClick("next");
            }
        }
    };
    // Auto Play Functions //
    let autoClick = (direction) => {
        if (direction !== "next" && direction !== "prev") {
            console.error('Invalid direction');
            return;
        }
    
        let currentCard = container.querySelector(".mainImage");
    
        if (!currentCard) {
            console.error('No main image found in container');
            return;
        }
    
        let currentButton = currentCard.querySelector(`[data-nqe-story-button="${direction}"]`);
    
        if (!currentButton) {
            console.error(`No ${direction} button found in main image`);
            return;
        }
    
        currentButton.click();
    
        if (currentCard.nextElementSibling) {
            startAutoPlay();
        }
    };

    // Using for test purposes //

  
    let contentEqualizer = function() {
        let heights = [];
        let widths = [];
        let values = {
            foundHeight: {},
            foundWidth: {}
        };
    
        allCards.forEach(function(card){
            let cardRect = card.getBoundingClientRect();
            let height = Math.floor(cardRect.height * 100 ) / 100;
            let width = Math.round(cardRect.width * 100 ) / 100;
    
            heights.push(height);
            widths.push(width);
    
            values.foundHeight[height] = (values.foundHeight[height] || 0) + 1;
            values.foundWidth[width] = (values.foundWidth[width] || 0) + 1;
        });
    
        let hightestComparedHeightValue = 0;
        let hightestComparedWidthValue = 0;
        let newHeight;
        let newWidth;
    
        for (let height in values.foundHeight) {
            if (values.foundHeight[height] > hightestComparedHeightValue) {
                hightestComparedHeightValue = values.foundHeight[height];
                newHeight = height;
            }
        }
    
        for (let width in values.foundWidth) {
            if (values.foundWidth[width] > hightestComparedWidthValue) {
                hightestComparedWidthValue = values.foundWidth[width];
                newWidth = width;
            }
        }
    
        allCards.forEach(function(card){
            let cardRect = card.getBoundingClientRect();
            let height = Math.floor(cardRect.height * 100 ) / 100;
            let width = Math.round(cardRect.width * 100 ) / 100;
    
            if (height !== newHeight || width !== newWidth) {
                card.style.height = `${newHeight}px`;
                card.style.width = `${newWidth}px`;
            }
        });
    };

    contentEqualizer()

    let transformContainer = () => {
        let firstCard = container.querySelector("[data-nqe-locate]");
        let bottomLocate = storyContainer.querySelector("[data-nqe-bottom-locate]");
    
        if (!firstCard) {
            console.error('No card found with data-nqe-locate attribute');
            return;
        }
    
        if (!bottomLocate) {
            console.error('No element found with data-nqe-bottom-locate attribute');
            return;
        }
    
        let cardWidth = firstCard.getBoundingClientRect().width;
        let pageWidth = bottomLocate.getBoundingClientRect().width;
        let translate = (50 - (100 - (((pageWidth - (cardWidth / 2)) / pageWidth) * 100)));
    
        if(window.matchMedia("(min-width: 767px)").matches) {
            container.style.transform  = `translateX(${translate}%)`;
        } else {
            container.style.transform  = `unset`;
        }
    };

    transformContainer()

    // Due not rebind any events that affect buttons or cards //

    if (status != "viewed") {
        // Reset Function which will return everything back to the orignal position //
        let reset = () => {
            clearInterval(interval);
            buttonCounter = 0;
            active = true;
            heights = [];
            widths = [];
            values = {
                foundHeight : {},
                foundWidth: {}
            };
        
            allCards.forEach(function(card){
                card.style.transform  = `unset`;
                let originalOrder = card.getAttribute("data-original-order");
        
                if (!originalOrder) {
                    console.error('No original order attribute found on card');
                    return;
                }
        
                card.setAttribute("data-remaining-time", "0");
                card.setAttribute("data-card-order", originalOrder);
                card.classList.remove("mainImage","prevImage","nextImage");
        
                if (originalOrder === "0") {
                    card.classList.add("mainImage");
                } else {
                    card.classList.add("nextImage");
                }
            });
        
            progressBars.forEach(function(bar){
                let div = bar.querySelector('div');
        
                if (!div) {
                    console.error('No div found in progress bar');
                    return;
                }
        
                div.style.width = "0%";
            });
        };

        // Used to update the card order and progress bar when the next or previous buttons are clicked //

        let updateCardOrder = function(card, direction, progressBar) {
            if (!card || !progressBar || (direction !== "next" && direction !== "prev")) {
                console.error('Invalid arguments');
                return;
            }
        
            let progressBarValue = direction === "next" ? 1 : 0;
            card.classList.remove("mainImage", "z-10");
            card.setAttribute('data-remaining-time', "0");
        
            let progressBarDiv = progressBar.querySelector('div');
            if (!progressBarDiv) {
                console.error('No div found in progress bar');
                return;
            }
        
            progressBarDiv.style.width = `${progressBarValue * 100}%`;
            clearInterval(interval);
            interval = setInterval(startAutoPlay, 100);
            active = true;
        };

        // Function that is used when the next or previous buttons are clicked //

        let updateOrder = function(count, direction) {
            if (typeof count !== 'number' || (direction !== 'next' && direction !== 'prev')) {
                throw new Error('Invalid arguments');
            }
        
            let transitionValue = count * 100;
        
            allCards.forEach(function(card) {
                let video = card.querySelector("video");
                let order = parseInt(card.getAttribute("data-card-order"));
        
                if (isNaN(order)) {
                    throw new Error('Invalid card order');
                }
        
                if (direction === "next") {
                    order--;
                } else {
                    order++;
                }
        
                card.setAttribute("data-card-order", order.toString());
        
                if (order === 0) {
                    if (video) {
                        video.play();
                    }
                    card.classList.add("mainImage", "z-10");
        
                    if (window.matchMedia("(min-width: 768px)").matches) {
                        card.style.transform = `translateX(-${transitionValue}%)`;
                    }
                } else if (order < 0) {
                    card.classList.add("prevImage");
        
                    if (window.matchMedia("(min-width: 768px)").matches) {
                        card.style.transform = `translateX(-${transitionValue}%)`;
                    }
                }
            });
        };

        // ****All BIND EVENTs****** //

            buttons.forEach(function(button){
                let direction = button.getAttribute("data-nqe-story-button");
            
                if (!direction) {
                    console.error('No direction attribute found on button');
                    return;
                }
            
                button.addEventListener("click", function(e) {
                    let currentCard = this.closest("[data-card-order]");
                    let currentBarOriginalID = currentCard.getAttribute("data-original-order");
                    let currentProgressBar = progressBarContainer.querySelector(`[data-progess-order="${currentBarOriginalID}"]`);
                    let video = currentCard.querySelector("video");
            
                    if (!currentCard || !currentBarOriginalID || !currentProgressBar) {
                        console.error('Missing required elements or attributes');
                        return;
                    }
            
                    if (direction === "next" && buttonCounter < items - 1) {
                        buttonCounter += 1;
                        if (video) {
                            video.currentTime = 0;
                            video.pause();
                        }
                        updateCardOrder(currentCard, direction, currentProgressBar);
                        updateOrder(buttonCounter, "next");
                    } else if (direction === "prev" && buttonCounter !== 0) {
                        buttonCounter -= 1;
                        if (video) {
                            video.currentTime = 0;
                            video.pause();
                        }
                        updateCardOrder(currentCard, direction, currentProgressBar);
                        updateOrder(buttonCounter, "prev");
                    } else if (direction === "prev" && buttonCounter === 0) {
                        if (video) {
                            video.currentTime = 0;
                            video.play();
                        }
                        currentCard.setAttribute('data-remaining-time', "0");
                        currentProgressBar.querySelector('div').style.width = "0%";
                        clearInterval(interval);
                        interval = setInterval(startAutoPlay, 100);
                        active = true;
                    } else {
                        reset();
                        autoStory(storyContainer);
                        storyContainer.classList.add("hidden");
                        storyContainer.classList.remove("nql-show-fast");
                    }
                });
            });

            // Play Button & Pause & Exit //

            // Working //
            let playButton = storyContainer.querySelector("[data-nqe-playButton]");
            if (!playButton) {
            console.error('No play button found');
            return;
            }

            playButton.addEventListener("click", function(){
            let currentCard = container.querySelector(".mainImage");
            if (!currentCard) {
                console.error('No main image found');
                return;
            }

            let video = currentCard.querySelector("video");
            if (video) {
                video.play();
            }

            startPauseButtonContainer.classList.add("pause");
            interval = setInterval(startAutoPlay, 100);
            active = true;
            });

            // Working //
            let pauseButton = storyContainer.querySelector("[data-nqe-pauseButton]");
            if (!pauseButton) {
            console.error('No pause button found');
            return;
            }

            pauseButton.addEventListener("click", function(){
            let currentCard = container.querySelector(".mainImage");
            if (!currentCard) {
                console.error('No main image found');
                return;
            }

            let video = currentCard.querySelector("video");
            if (video) {
                video.pause();
            }

            startPauseButtonContainer.classList.remove("pause");
            clearInterval(interval);
            active = false;
            });

            // Working //
            let exitButton = storyContainer.querySelector("[data-nqe-exitButton]");
            if (!exitButton) {
            console.error('No exit button found');
            return;
            }

            exitButton.addEventListener("click", function(){
            reset();
            storyContainer.classList.add("hidden");
            storyContainer.classList.remove("nql-show-fast");
            });

            // Pause and Play on card //

            allCards.forEach(function(currentCard){
                if (!('ontouchstart' in window)) {
                    console.error('Touch events not supported');
                    return;
                }
            
                let touchStartX = 0;
                let touchEndX = 0;
            
                function handleTouchStart(e) {
                    touchStartX = e.changedTouches[0].screenX;
                }
            
                function handleTouchEnd(e) {
                    touchEndX = e.changedTouches[0].screenX;
                    handleSwipeGesture();
                }
            
                function handleSwipeGesture() {
                    if (touchEndX < touchStartX) {
                        autoClick("next");
                    }
            
                    if (touchEndX > touchStartX) {
                        autoClick("prev");
                    }
                }
            
                currentCard.addEventListener('touchstart', handleTouchStart, false);        
                currentCard.addEventListener('touchend', handleTouchEnd, false);
            
                currentCard.addEventListener("touchstart", (e) => {
                    if (currentCard.classList.contains("mainImage")) {
                        let video = currentCard.querySelector("video");
                        if (active && video) {
                            video.pause();
                            startPauseButtonContainer.classList.remove("pause");
                            clearInterval(interval);
                            active = false;
                        }
                    }           
                });
                
                currentCard.addEventListener("touchend", (e) => {
                    if (currentCard.classList.contains("mainImage")) {
                        let video = currentCard.querySelector("video");
                        if (!active && video) {
                            video.play();
                            startPauseButtonContainer.classList.add("pause");
                            clearInterval(interval);
                            interval = setInterval(startAutoPlay, 100);
                            active = true;
                        }
                    } 
                });
            
                currentCard.addEventListener('click',(e) => {
                    if (currentCard.classList.contains("mainImage")) {
                        let video = currentCard.querySelector("video");
                        if (active && video) {
                            video.pause();
                            startPauseButtonContainer.classList.remove("pause");
                            clearInterval(interval);
                            active = false;
                        } else if (video) {
                            video.play();
                            startPauseButtonContainer.classList.add("pause");
                            clearInterval(interval);
                            interval = setInterval(startAutoPlay, 100);
                            active = true;
                        }
                    }
                });
            });

            window.addEventListener("resize", function() {
                reset()
                storyContainer.classList.add("hidden")
                storyContainer.classList.remove("nql-show-fast")
            })
    }
}




