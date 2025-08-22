/**
 * BOWDOIN COLLEGE INTERLIBRARY LOAN
 * 
 * File containing export citation feature.
 * It is for use only on the 'Finished Requests' history page. Given a basis for filtering, the requests 
 * are selected, data retrieved and formatted, and ready to download in either .bib or .pdf format.
 * 
 * Need to update:
 * - Year options (every year): As of August, 2025, we are retaining data from July 2014 - July 2025, thus,
 * the year options range from 2014 to 2025. After each yearly data cut, year options need to be updated.
 * - URL for fetching data: The function fetchCitationData, creates a URL path for each transaction request,
 * as of now, it links to the testweb, so 'testweb/' needs to be removed from URL path once transitioned to 
 * live site.
 * 
 * @author Melanie Ovalle 
 * @date Summer 2025
 */


/** Global Variables */
const ALL_CARDS = document.getElementsByClassName("card");  // all cards on finished requests history page
let YEAR_INPUT = document.querySelector(".selectYear")      // year selected to filter requests
let SELECTED_CARDS = new Array();                           // temp array for selected cards
let TOTAL_CARDS_SELECTED = 0;                               // total number of selected cards


/** Display checkbox next to cards when user is on 'Finished Requests' page */
const pageHeader = document.querySelector(".page-header").innerText
if (pageHeader === " Finished Requests") { // must have a leading white space
  let tempCards = document.querySelectorAll(".select-card-checkbox")
  for (let i = 0; i < tempCards.length; i++){
    tempCards[i].style.display = "flex"
  }
}


/** 
 * Filter cards based on selected option (Select Manually, Select All, Select 
 * by Year, Clear All). Upon selection, clears all cards, selects request cards 
 * that fulfill condition, and disables checkbox unless its on 'Select Manually'.
 */
let selectOptions = document.getElementById("ExportOptions");

selectOptions.addEventListener("change", function() {

  if (selectOptions.value === "selectAll") {
    unselectAllRequests();  // gurantees any option selected prior is cleared
    selectAllRequests();
    disableCheckbox();
  }

  else if (selectOptions.value === "manuallySelect") {
    unselectAllRequests();
    enableCheckbox()
  }

  else if(selectOptions.value === "selectYear") {
    unselectAllRequests();
    
    YEAR_INPUT.style.display = "block" // display year input field
    YEAR_INPUT.addEventListener("change", function(){
      selectByYear(YEAR_INPUT.value)
    })
    disableCheckbox();
  }

  else if(selectOptions.value === "clearAll") {
    unselectAllRequests();
    disableCheckbox();
  }
})


/** Disables checkbox when selected option is not 'Select Manually' */
function disableCheckbox() {
  let tempCards = document.querySelectorAll(".select-card-checkbox")
  for (let i = 0; i < tempCards.length; i++){
    tempCards[i].querySelector("input").disabled = true;
  }
}


/** Enables checkbox when selected option is 'Select Manually' */
function enableCheckbox() {
  let tempCards = document.querySelectorAll(".select-card-checkbox")
  for (let i = 0; i < tempCards.length; i++){
    tempCards[i].querySelector("input").disabled = false;
  }
}


/*********** FILTER CARDS BASED ON SELECTED OPTION *************/

/** Marks all cards as selected */
function selectAllRequests() {
  for (let i = 0; i < ALL_CARDS.length; i++){
    ALL_CARDS[i].querySelector("input").checked = true
  }
}


/** Marks all cards as unselected */
function unselectAllRequests() {
  YEAR_INPUT.style.display = "none"  // hide year input field

  for (let i = 0; i < ALL_CARDS.length; i++){
    ALL_CARDS[i].querySelector("input").checked = false
  }
}


/** Mark cards as selected based on given year */
function selectByYear(year) {
  // retrive the current year of request, and check is the same as year given
  for (let i = 0; i < ALL_CARDS.length; i++) {
    let transactionDate = new Date (ALL_CARDS[i].querySelector(".data-right").children[3].querySelector("span").innerText);
    let currentYear = transactionDate.getFullYear()

    if (currentYear === Number(year)) {
      ALL_CARDS[i].querySelector("input").checked = true
    } else {
      ALL_CARDS[i].querySelector("input").checked = false
    }
  }
}


/** Retrieve Cards Selected by User */
function getSelectedCards() {
  for (let i = 0; i < ALL_CARDS.length; i++){
    if (ALL_CARDS[i].querySelector("#cardSelected").querySelector("input").checked) {
      SELECTED_CARDS.push(ALL_CARDS[i]);
      TOTAL_CARDS_SELECTED += 1;
    }
  }

  console.log(TOTAL_CARDS_SELECTED, " cards where selected")
}


/************ ADD FUNCTIONALITY TO EXPORT BTNS **********************/

let export_btn = document.getElementById("export-btn");
let downloadBIB_btn = document.getElementById("bib-file");
let downloadPDF_btn = document.getElementById("pdf-file");

/**
 * Once user clicks 'export', if there is at least 1 card selected, user will have the 
 * ability to select export type (bib or pdf), which calls the respective fn to download file.
 */
export_btn.addEventListener("click", function() {

  getSelectedCards();
  if (TOTAL_CARDS_SELECTED === 0) {
    downloadBIB_btn.disabled = true;
    downloadPDF_btn.disabled = true;
  } else {
    downloadBIB_btn.disabled = false;
    downloadPDF_btn.disabled = false;
  }

  // initialize values if user chooses to download multiple citations
  TOTAL_CARDS_SELECTED = 0;
  SELECTED_CARDS = new Array();
});

downloadBIB_btn.addEventListener("click", function() {

  exportBibTeX();

  // initialize values if user chooses to download multiple citations
  TOTAL_CARDS_SELECTED = 0;
  SELECTED_CARDS = new Array();
});

downloadPDF_btn.addEventListener("click", function() {

  exportPDF();

  // initialize values if user chooses to download multiple citations
  TOTAL_CARDS_SELECTED = 0;
  SELECTED_CARDS = new Array();
});


/********** RETRIEVE INFORMATION, CREATE CITATION(S), AND GENERATE FILE ***********/

/** Create and download a .pdf file with citations */
function downloadPDF(filename, content) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF(); 
  doc.setFont("times");
  doc.setFontSize(15);
  doc.text(80, 20, "Interlibrary Loan History");    // header

  doc.setFont("times");
  doc.setFontSize(12);
  doc.text(15, 30, content,{ maxWidth: 150 });      // citations
  
  doc.save(filename);
}


/** Create and download a .bib file with citations */
function downloadBIB(filename, content) {
  const blob = new Blob([content], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}


/********** Format APA Citation for PDF**********/

/**
 * Retrieves selected cards, extracts information for each card, parses info
 * into APA format, and creates a PDF containing all citations.
 */
async function exportPDF() {

  getSelectedCards();

  let pdfPromises = [];
  for (let card in SELECTED_CARDS) {
    let transactionNumber = SELECTED_CARDS[card].querySelector('.field-value')?.innerText;
    let requestType = SELECTED_CARDS[card].innerHTML.includes("Article") ? "article" : "loan";
    pdfPromises.push(getCitationInfoApa(transactionNumber, requestType));
  }

  const pdfCards = await Promise.all(pdfPromises);

  console.log("All citations:", pdfCards.join('\n'))

  downloadPDF('citations.pdf', pdfCards.join('\n\n'));
  return;
}

/**
 * Fetches citation data for given transaction number and based on the
 * type of request (article or loan) calls appropiate fn to format data.
 * 
 * @param {number} transactionNum : Unique transaction number of request.
 * @param {string} requestType : Either Article or Loan.
 * @returns String entry that contains APA citation of given request.
 */
async function getCitationInfoApa(transactionNum, requestType) {

  const infoDoc = await fetchCitationData(transactionNum);

  console.log("this is the type of the info doc", typeof(infoDoc))
  console.log("this is the doc", infoDoc)
  let entry;
  if (requestType === "article") {
    entry = await getApaCitationArticle(infoDoc); 
  } else {
    entry = await getApaCitationLoan(infoDoc);
  }

  return entry;
}


/**
 * Retrieves HTML document object, extract and clean citation information, and based on 
 * document type (article, book chapter, table contents, conference paper), it formats
 * citation following APA guidelines. (Only formats correctly English Language chars).
 * 
 * Article / Book Ch: Author, A. (Year). Title. Volume (Issue), page range. Place of Publication. Publisher. DOI
 * Conference:  Author, A. (Year). Title. Place of Publication. Publisher. DOI
 * Table Contents:  Author, A. (Year). Title. Place of Publication. Publisher. DOI
 * 
 * @param {Object} infoDoc HTML Document Object Model from 'details' section in request card.
 * @returns String entry that contains APA citation of given request.
 */
function getApaCitationArticle(infoDoc) {
  const documentType = infoDoc.getElementById("DocumentType")?.textContent.trim();

  // retrieve and clean citation info
  const author = infoDoc.getElementById('PhotoArticleAuthor')?.textContent || infoDoc.getElementById('PhotoItemAuthor')?.textContent;
  const date = infoDoc.getElementById('PhotoJournalYear')?.textContent.trim().replace(/\[|\]/g,'');
  const title = infoDoc.getElementById('PhotoJournalTitle')?.textContent.trim().replace(/\.$/, '').replace(/\s+/g, ' '); 
  const articleTitle = infoDoc.getElementById('PhotoArticleTitle')?.textContent.trim().replace(/\.$/, '');
  const volume = infoDoc.getElementById('PhotoJournalVolume')?.textContent.trim();
  const issue = infoDoc.getElementById('PhotoJournalIssue')?.textContent.trim();
  const pages = infoDoc.getElementById('PhotoJournalInclusivePages')?.textContent.trim();
  const doi = infoDoc.getElementById('DOI')?.textContent.trim();
  
  const publicationPlace = infoDoc.getElementById('PhotoItemPlace')?.textContent.trim();
  console.log("Before cleaning: ", publicationPlace)
  console.log("After cleaning: ", publicationPlace.replace(/[.,:']+$/, ''))
  const publisher = infoDoc.getElementById('PhotoItemPublisher')?.textContent.trim().replace(/[.,:']+$/, '');
  
  // format citation info
  const authorInfo = getAuthorInfo(author);
  const dateInfo = (!isNaN(date)) ? `(${date}).` : "";
  const titleInfo = (title && articleTitle) ? `${title}. ${articleTitle}.` : `${title}.`;
  const issueInfo = (volume && issue) ? `${volume}(${issue}),` : (volume) ? `${volume}.` : "";
  const pageInfo = (pages != '-' && pages) ? `${pages}.` : "";
  const publicationInfo = (publicationPlace != "undefined") ? `${publicationPlace}` : "";
  const publisherInfo = publisher ? `${publisher}.` : "";

  // create citation entry
  let apaCitation = authorInfo ? `${authorInfo} ${dateInfo} ${titleInfo}` : `${titleInfo} ${dateInfo}`;

  if (documentType === "Conference") {
    apaCitation += ` ${publicationInfo} ${publisherInfo} ${doi}`;
  } 
  else if (documentType === "Table Contents") {
    apaCitation += `${authorInfo} ${dateInfo} ${titleInfo} ${issueInfo} ${publicationInfo} ${publisherInfo} ${doi}`;
  } 
  else { // article or book chapter doc type
    apaCitation += `${authorInfo} ${dateInfo} ${titleInfo} ${issueInfo} ${pageInfo} ${publicationInfo} ${publisherInfo} ${doi}`;
  }

  // remove any additional white spaces
  console.log(apaCitation.replace(/\s+/g, ' '))
  return apaCitation.replace(/\s+/g, ' ');
}


/** 
 * Retrieves HTML document object, extract and clean citation information, and formats
 * citation following APA guidelines. (Only formats correctly English Language chars).
 * 
 * Book: Author, A. (Year). Title of book. Edition. Place of Publication. Publisher. DOI.
 * Loans: Author, A. (Year). Title of book. Edition. Place of Publication. Publisher.
 * 
 * @param {Object} infoDoc HTML Document Object Model from 'details' section in request card.
 * @returns String entry that contains APA citation of given request.
 */
function getApaCitationLoan(infoDoc) {
  const documentType = infoDoc.getElementById("DocumentType")?.textContent.trim();
  
  // retrieve and clean citation info
  const author = infoDoc.getElementById('LoanAuthor')?.textContent.trim() || '';
  const date = infoDoc.getElementById('LoanDate')?.textContent.trim();
  const title = infoDoc.getElementById('LoanTitle')?.textContent.trim().replace(/[.,/]+$/, '').replace(/\s+/g, ' ');
  const publicationPlace = infoDoc.getElementById('LoanPlace')?.textContent.trim().replace(/[.,:']+$/, '') || '';
  const edition = infoDoc.getElementById('LoanEdition')?.textContent.trim() || '';
  const publisher = infoDoc.getElementById('LoanPublisher')?.textContent.trim().replace(/\,/g, '').replace(/[.,:']+$/, '');
  const doi = infoDoc.getElementById('DOI')?.textContent.trim();
  const isbn = infoDoc.getElementById('issn')?.textContent.trim();

  // format citation info
  const authorInfo = getAuthorInfo(author);
  const dateInfo = (!isNaN(date)) ? `(${date}).` : "";
  const titleInfo = title? `${title}.` : "";
  const editionInfo = edition ? `(${edition})`: "";
  const publicationInfo = (publicationPlace != "undefined" && publicationPlace) ? `${publicationPlace}.` : "";
  const publisherInfo = publisher ? `${publisher}.` : "";
  const doiInfo = doi ? `${doi}` : "";
  const isbnInfo = isbn ? `${isbn}` : "";

  // create citation entry
  // if no author is given citation will start with title
  let apaCitation = authorInfo ? `${authorInfo} ${dateInfo} ${titleInfo}` : `${titleInfo} ${dateInfo}`;

  if (documentType === "Book") {
    apaCitation += `${editionInfo} ${publicationInfo} ${publisherInfo} ${doiInfo} ${isbnInfo}`;
  }
  else {
    apaCitation += `${editionInfo} ${publicationInfo} ${publisherInfo}`;
  }

  console.log("final apa citation", apaCitation.replace(/\s+/g, ' '))
  return apaCitation.replace(/\s+/g, ' ');
}


/**
 * Verifies whether a title has one or multiple authors.
 * Returns the author(s) information
 * 
 * @param {string} author - Author field retrieved from details document.
 * @return Formatted string containing author(s) info in 'LastName, Initial.' format.
 */
function getAuthorInfo(author) {

  const singleChars = /[A-Z]\./g;
  const digits = /\d+/g;
  const wordAuthor = /\bauthor\b/g;

  const cleanAuthor = author?.replace(singleChars, '').replace(digits, '').replace(wordAuthor, '').trim();

  // remove commas and extra white spaces
  const containsMultipleAuthors = cleanAuthor?.replace(/\,/g, '').replace(/\s+/g, ' ').split(" ");
  console.log("Does it have multiple authors?: ", containsMultipleAuthors)

  let authorInfo = "";

  if (containsMultipleAuthors.length  >= 4) {   // contains at least 2 first names and last names
    let authors = "";
    let lastName = "";
    let initial = "";

    for (let i = 0; i < containsMultipleAuthors.length; i+= 2) {
      initial = containsMultipleAuthors[i].split('')[0];
      lastName = containsMultipleAuthors[i+1];

      // add & if last author
      if (i == containsMultipleAuthors.length - 2) {
        authors += `& `
      }
      authors += `${lastName}, ${initial}., `;
    }
    authorInfo = authors.trim().replace(/\,$/, '');

  } else {  // contains 1 author
    const authorLastName = author?.split(" ")[0].replace(/,/, '') || '';
    const authorInitial =  author?.split(" ")[1]?.split('')[0] || '';
    authorInfo = author ? `${authorLastName}, ${authorInitial}.` : "";
  }

  return authorInfo;
}


/**************** Format Citation for BibTeX ******************/

/** Clean BibTeX special characters */
function cleanBibText(text) {
  return (text || '').replace(/[{}$#&~^%/]/g, '').trim();
}


/** 
 * Retrieves selected cards, creates citation for each card, and generates
 * file to export citation(s).
*/
async function exportBibTeX() {

  getSelectedCards();   // retrieve selected cards
  
  let bibTeXPromises = [];
  for (let card in SELECTED_CARDS) {
    let transactionNumber = SELECTED_CARDS[card].querySelector('.field-value')?.innerText;
    let requestType = SELECTED_CARDS[card].innerHTML.includes("Article") ? "article" : "book";

    bibTeXPromises.push(getCitationInfo(transactionNumber, requestType));
  }
  
  const bibTeXCards = await Promise.all(bibTeXPromises);

  console.log("All citations:", bibTeXCards.join('\n'))

  downloadBIB('citations.bib', bibTeXCards.join('\n\n'));
  return;
}


/** 
 * Fetch and parse HTML Transaction Data using the transaction number as 
 * unique value for building a URL to load the detailed info of request.
 */
async function fetchCitationData(transactionNum) {
  const url = `/testweb/illiad.dll?Action=10&Form=72&Value=${transactionNum}`;
  const response = await fetch(url);
  const html = await response.text();
  const parser = new DOMParser();
  const infoDoc = parser.parseFromString(html, 'text/html');

  return infoDoc;
}


/** 
 * Ensures detailed data is parsed and then builds citation. This prevents
 * the citation script from running before time, avoiding fetch errors.
 * Calls the appropiate citation fn based on requestType (Article or Loan)
 */
async function getCitationInfo(transactionNum, requestType) {

  const infoDoc = await fetchCitationData(transactionNum);

  let entry;
  if (requestType === "article") {
    entry = await getCitationArticle(infoDoc, transactionNum); 
  } else {
    entry = await getCitationLoan(infoDoc, transactionNum);
  }

  return entry;
}


/** 
 * Retrieves data for a Article Request Type, and populates fields for a BibTeX entry
 * 
 * @param {Object} infoDoc - HTML Document Object Model from 'details' section in request card.
 * @param {Number} transactionNum - Unique number identifier for transaction.
 * @returns BibTeX entry with given fields.
 */
function getCitationArticle(infoDoc, transactionNum) {

  // retrieve and clean data
  let documentType = infoDoc.getElementById('DocumentType')?.textContent.trim();
  const title = infoDoc.getElementById('PhotoJournalTitle')?.textContent.trim() + ": " + infoDoc.getElementById('PhotoArticleTitle')?.textContent.trim() || '';
  const author = infoDoc.getElementById('PhotoArticleAuthor')?.textContent.trim() || infoDoc.getElementById('PhotoItemAuthor')?.textContent.trim() || '';
  const publication = infoDoc.getElementById('PhotoItemPlace').textContent.trim();
  const volume = infoDoc.getElementById('PhotoJournalVolume')?.textContent.trim();
  const issue = infoDoc.getElementById('PhotoJournalIssue')?.textContent.trim();
  const pages = infoDoc.getElementById('PhotoJournalInclusivePages')?.textContent.trim();
  const issn = infoDoc.getElementById('issn')?.textContent.trim().replace(/:/g,'');
  const year = infoDoc.getElementById('PhotoJournalYear')?.textContent.trim().replace(/\[|\]/g,'');
  const doi = infoDoc.getElementById('DOI')?.textContent.trim();

  documentType = (documentType === 'Book Chapter') ? 'incollection' : (documentType === 'Conference') ? 'inproceedings' : 'article';
  const key = (author?.split(" ")[0] || "user") + '_' + (year || "0000");

  // populate fields for bib entry
  const fields = {
    title,
    author,
    year,
    publication,
    volume,
    number : issue,
    pages,
    issn,
    doi,
    note: `ILLIAD Transaction Number: ${transactionNum}`
  }

  return createBibTeXEntry(documentType, key, fields);
}


/**
 * Retrieves data for a Loan Request Type, and populates fields for a BibTeX entry
 * 
 * @param {Object} infoDoc - HTML Document Object Model from 'details' section in request card.
 * @param {Number} transactionNum - Unique number identifier for transaction.
 * @returns BibTeX entry with given fields.
 */
function getCitationLoan(infoDoc, transactionNum) {

  // retrieve and clean data
  const title = infoDoc.getElementById('LoanTitle')?.textContent.trim();
  const author = infoDoc.getElementById('LoanAuthor')?.textContent.trim() || '';
  const publisher = infoDoc.getElementById('LoanPublisher')?.textContent.trim();
  const publication = infoDoc.getElementById('LoanPlace')?.textContent.trim() || '';
  const year = infoDoc.getElementById('LoanDate')?.textContent.trim();
  const edition = infoDoc.getElementById('LoanEdition')?.textContent.trim() || '';
  const issn = infoDoc.getElementById('issn')?.textContent.trim().replace(/:/g,'');
  const doi = infoDoc.getElementById('DOI')?.textContent.trim();

  const documentType = 'book';
  const key = (author?.split(" ")[0] || "user") + '_' + (year || "yyyy");

  // populate fields fro bib entry
  const fields = {
    title,
    author,
    year,
    address: publication,
    publisher,
    edition,
    isbn: issn,
    doi,
    note: `ILLIAD Transaction Number: ${transactionNum}`
  }

  return createBibTeXEntry(documentType, key, fields);
}


/** Create BibTeX Entry for each request selected */
function createBibTeXEntry(requestType, key, fields) {
  let entry = `@${requestType}{${key}, \n`;

  // go through each field (title, author, volume...)
  for (const fieldName in fields) {
    const fieldValue = fields[fieldName];

    // add field to entry if a value is given
    if (fieldValue) {
      const cleanedValue = cleanBibText(fieldValue);
      entry += `${fieldName}={${cleanedValue}}, \n`;
    }
  }

  // remove the last comma from last field added
  entry = entry.trim().replace(/,$/, '');
  entry += '\n}'    // final line

  return entry;
}
