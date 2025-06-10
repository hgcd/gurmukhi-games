function shakeElement(id) {
    // Add a CSS class for the shake animation
    document.getElementById(id).classList.add('shake-animation');
    
    // Remove the class after animation completes
    setTimeout(() => {
        document.getElementById(id).classList.remove('shake-animation');
    }, 500);
}

function dipElement(id) {
    document.getElementById(id).classList.add('dip-animation');
    setTimeout(() => {
        document.getElementById(id).classList.remove('dip-animation');
    }, 500);
}

function bounceElement(id) {
    document.getElementById(id).classList.add('bounce-animation');
    setTimeout(() => {
        document.getElementById(id).classList.remove('bounce-animation');
    }, 500);
}