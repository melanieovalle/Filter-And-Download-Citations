/**
 * This file contains a script to filter transactions based on their
 * transaction status. If transaction is 'finished' or 'cancelled', 
 * then it displays the final transaction date in a mm/dd/yyyy format.
 * 
 * @author Melanie Ovalle
 */

// populate cards array with all the card elements
let card_arr = new Array();
let temp_var = document.getElementsByClassName("card");
for (let i = 0; i < temp_var.length; i++){
    card_arr[i] = temp_var[i];
}

// retrive finished date and populate finished requests
for (let i = 0; i < card_arr.length; i++) {
    // retrieve card status
    let status = card_arr[i].querySelector(".data-right").children[0].querySelector("span").innerText;
    
    // retrive transaction date of request
    let transactionDate = new Date (card_arr[i].querySelector(".data-right").children[3].querySelector("span").innerText);
    
    // retrieve div element to display date
    let displayDate = card_arr[i].querySelector(".data-right").children[4].querySelector("span");
    
    // trim transaction date to remove time
    let year = transactionDate.getFullYear()
    let month = String(transactionDate.getMonth() +1).padStart(2, '0');  // month is 0-indexed
    let day = String(transactionDate.getDate()).padStart(2, '0');

    let fullDate = `${month}/${day}/${year}`

    // make final transaction date visible only when request is finished
    if (status === "Request Finished" || status === "Cancelled/Unfilled") {
        displayDate.textContent  = fullDate;
    }
}
