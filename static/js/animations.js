function shakeElement(id) {
    // Add a CSS class for the shake animation
    const element = document.getElementById(id);
    if (element) {
        element.classList.add('shake-animation');
        
        // Remove the class after animation completes
        setTimeout(() => {
            element.classList.remove('shake-animation');
        }, 500);
    } else {
        console.warn(`Element with id '${id}' not found for shake animation`);
    }
}

function dipElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.add('dip-animation');
        setTimeout(() => {
            element.classList.remove('dip-animation');
        }, 500);
    } else {
        console.warn(`Element with id '${id}' not found for dip animation`);
    }
}

function bounceElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.add('bounce-animation');
        setTimeout(() => {
            element.classList.remove('bounce-animation');
        }, 500);
    } else {
        console.warn(`Element with id '${id}' not found for bounce animation`);
    }
}