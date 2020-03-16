import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'lib-adv-search-lib',
  templateUrl: './adv-search-lib.html',
  styleUrls: ['./adv-search-lib.css']
})
export class AdvSearchLibComponent implements OnInit {

  @Input() lookupConfig: any;
  @Output() submitAdvsearch = new EventEmitter();
  @Input() jsonobj: any;

  showSuggestionBox = false;
  suggestionList = [];
  searchCriteria = '';
  searchObj = {};
  listOfLookUpValues = [];
  statusOfSearchCriteria = false;
  plsEnterValue = "Please Enter Value";
  plsEnterValidCriteria = 'Please Enter Valid Criteria';
  plsEnterCriteria = 'Please Enter Search Criteria';
  currentWordInfo = {};
  lastIndex = 0;
  showValueBox = false;
  typeOfValue = 'text';
  typeOfArithemeticOperator = '';
  columnKey = '';


  constructor() { }

  ngOnInit() {
    // if (this.lookupConfig) {
    //   this.loadAllLookUpValues();
    // }
    // this.loadColumnsSuggestionBox();
    this.addEventOnDocument();
    this.addKeydownEventOnDocument();
  }




  /** adds the click event on  docuement */
  addEventOnDocument() {
    document.onclick = (event) => { this.suggetionListClickOff(event) }
  }

  suggetionListClickOff(event) {
    const classList = this.getClassList(event)
    const array = classList.filter(item => {
      return (item === 'suggestion-list-box' || item === 'show-value-box');
    });
    if (array.length === 0) {
      this.showSuggestionBox = false;
      this.showValueBox = false;
    }

  }

  /** get classlist based on click event  */
  getClassList(event) {
    const target = (event) ? event.target : '';
    const parent = (target) ? target.offsetParent : '';
    const grandParent = (parent) ? parent.offsetParent : '';
    const parentClassList = parent ? this.converToArray(parent.classList) : [];
    const grandParentClassList = grandParent ? this.converToArray(grandParent.classList) : [];
    let classList = this.converToArray(target.classList);
    classList = classList.concat(parentClassList);
    classList = classList.concat(grandParentClassList);
    return classList;
  }

  /** flatify the array  */
  converToArray(list) {
    list = [...list];
    return list;
  }

  /** loads all lookup values  */
  // loadAllLookUpValues() {
  //   this.lookupConfig.forEach(config => {
  //     this.apiCallToLookUpValues(config);
  //   });
  // }

  // /**api call for lookup values  */
  // apiCallToLookUpValues(config) {
  //   advancedSearchService.getApiCall(config.queryparam, function (response) {
  //     this[config.column] = response[config.dataKey];
  //   });
  // }

  pasteOnSearchArea() {
    this.setHeightOfSearchArea();
    setTimeout(() => {
      this.validateSearchCriteria();
    }, 100)
  }

  keyUpOnSearchArea(e) {
    let ele = e.currentTarget;
    this.setHeightWithScrollHieght(ele);
    this.actionsBasedOnEvent(e);
    if (e.code === 'Space') {
      this.handleActionOnSpace(e);
    } else if (e.code === 'Enter' || e.code === 'NumpadEnter') {
      e.preventDefault();
      this.handleEnterEvent();
    } else if (this.checkWithUpAndDownArrow(e)) {
      this.searchBasedOnCursorPosition();
    }
  }


  checkWithUpAndDownArrow(e) {
    let flag = true;
    if ((e.which == 38 || e.which == 40) && this.showSuggestionBox) {
      flag = false;
    }
    return flag;
  }


  /** prepares search criteria */
  handleEnterEvent() {
    this.searchCriteria = this.searchCriteria.trim();
    if (this.searchCriteria && this.statusOfSearchCriteria) {
      let criteria = this.searchCriteria.trim();
      let criteriaForPayload = this.getPayloadOfAdvSearch(criteria);
      var nullRegex = new RegExp("'null'", "g");
      criteriaForPayload = criteriaForPayload.replace(nullRegex, "null");
      criteriaForPayload = criteriaForPayload.replace("''", '');
      let payload = {
        query: criteriaForPayload
      }
      this.submitAdvsearch.emit({ payload, criteria });
    } else if (!this.searchCriteria) {
      console.log(this.plsEnterCriteria);
    } else {
      console.log(this.plsEnterValidCriteria);
    }
  }

  /** it will pass the payload to parent control */
  getPayloadOfAdvSearch(criteria) {
    let words = this.getPreviousWords(criteria);
    let wordsMetaData = this.getMetaDataOfWords(words);
    let searchCriteriaList = [];
    wordsMetaData.forEach((word, index) => {
      if (word.type == 'value') {
        let value = this.getFormatedValueForAPI(word, index, wordsMetaData);
        searchCriteriaList.push(value)
      } else {
        let key = word.key || word.name;
        searchCriteriaList.push(key);
      }
    });
    // searchCriteriaList = this.checkWithLatAndLangCols(searchCriteriaList);
    let targetCriteria = searchCriteriaList.join(' ');
    return targetCriteria;
  }

  getFormatedValueForAPI(word, index, words) {
    let value = word.name;
    let arOperator = words[index - 1];
    if (arOperator.key === 'like' || arOperator.key === 'N_Lk') {
      if (this.isAlreadyQuoted(value)) {
        const length = value.length;
        value = value.substring(1, length - 1);
      }
      value = `%${value}%`;
    }
    value = this.updateWithQuotesToValue(value, arOperator);
    return value;
  }


  /** formates the value of current obj */
  updateWithQuotesToValue(val, arOperator) {
    let value = '';
    let flag = /[()]/.test(val);
    if (flag) {
      value = this.getQuotedText(val);
      value = this.checkWithBetweenOperator(value, arOperator);
    } else if (this.isAlreadyQuoted(val)) {
      const length = val.length;
      value = val.substring(1, length - 1);
      value = "'" + value + "'";
    } else {
      value = "'" + val + "'";
    }
    return value;
  }

  isAlreadyQuoted(val) {
    if (val.startsWith('"') || val.startsWith("'")) {
      return true;
    }
    return false;
  }

  checkWithBetweenOperator(val, arOperator) {
    if (arOperator && !(arOperator.key == 'between' || arOperator.key == 'NT_bw')) {
      val = "(" + val + ")";
    }
    return val;
  }

  /** returns the quoted text */
  getQuotedText(val) {
    let value = val.replace(/[()]/g, '');
    value = value.trim();
    let arr = value.split(',');
    arr = arr.map(val => {
      return "'" + val + "'";
    });
    value = arr.join(',');
    return value;
  }


  searchBasedOnCursorPosition() {
    this.currentWordInfo = this.getCurrentWordInformation();
    this.searchBasedOnWord(this.currentWordInfo['currentWord']);
    this.setSuggestionListWithSearchWord(this.currentWordInfo['matchedWord']);
    this.validateSearchCriteria();
  }

  handleActionOnSpace(e) {
    this.currentWordInfo = this.getCurrentWordInformation('Space');
    this.searchBasedOnWord(this.currentWordInfo['currentWord'], 'Space');
    this.validateSearchCriteria();
  }

  getCurrentWordInformation(action?: any) {
    let obj = {};
    obj['words'] = this.getWordsUptoCurrentPosition();
    obj['wordsMetaData'] = this.getMetaDataOfWords(obj['words']);
    obj = Object.assign(obj, this.getCurrentWordData(obj['words']));
    obj['lastAction'] = (action) ? 'Space' : 'navigation';
    obj['wordReplacement'] = this.replaceWordWithSelection(obj)
    return obj;
  }

  replaceWordWithSelection(obj) {
    let words = obj.words;
    let currentWord = words[words.length - 1];
    let isQuotesStart = (currentWord) ? currentWord.startsWith('"') : false;
    let isQuotesEnd = (currentWord) ? currentWord.endsWith('"') : false;
    let flag = (isQuotesStart && !isQuotesEnd) ? true : false;
    return flag;
  }

  getMetaDataOfWords(words) {
    let array = [];
    let list = [{ type: 'startParanthesis', next: 'column' },
    { type: 'column', next: 'arithmeticOperator' },
    { type: 'arithmeticOperator', next: 'value' },
    { type: 'value', next: ['logicalOperator', 'endParanthesis'] },
    { type: 'endParanthesis', next: 'logicalOperator' },
    { type: 'logicalOperator', next: ['column', 'startParanthesis'] }];
    let type;
    words.forEach((word, index) => {
      if (index == 0) {
        type = (word === '(') ? 'startParanthesis' : 'column';
      } else {
        let obj = list.find(listItem => {
          return (listItem.type === type);
        });
        if (Array.isArray(obj.next)) {
          type = (word == '(' || word == ')') ? obj.next[1] : obj.next[0];
        } else {
          type = obj.next;
        }
      }
      let strMetaData;
      if (type === 'value') {
        let col = array[index - 2];
        let dataType = col.columnDataType;
        strMetaData = this.getMetaDataOfWord(word, type, dataType)
      } else {
        strMetaData = this.getMetaDataOfWord(word, type);
      }
      array.push(strMetaData);
    });
    return array;
  }

  getMetaDataOfWord(word, type, dataType?: any) {
    let obj;
    if (type === 'value') {
      obj = { name: word, type: type, dataType: dataType }
    } else if (type === 'startParanthesis' || type === 'endParanthesis') {
      obj = { name: word, type: type }
    } else {
      let arr = this.jsonobj[type];
      obj = arr.find(item => {
        return (this.getLowerCaseValue(item.name) === this.getLowerCaseValue(word));
      });
      if (type == 'column') {
        if (obj) {
          obj.columnDataType = this.getColDataType(obj)
        } else {
          obj = { name: word, type: type, columnDataType: 'text' }
        }
      }
    }
    let targetObj = obj ? obj : { name: word, type: type };
    return targetObj;
  }

  getCurrentWordData(words) {
    let obj = {};
    let length = (words) ? words.length : 0
    this.searchCriteria = this.searchCriteria.trim();
    let wordsList = this.getPreviousWords(this.searchCriteria);
    if (wordsList.length > 0) {
      obj['currentWord'] = wordsList[length - 1]; //return last word
    }
    if (words && words.length > 0) {
      obj['matchedWord'] = words[length - 1]
    }

    return obj;
  }

  keyDownOnSearchArea(e) {
    if (e.keyCode == 13) {
      e.preventDefault();
    }
  }

  actionsBasedOnEvent(event) {
    this.displaySuggestionBox();
  }

  displaySuggestionBox() {
    this.showSuggestionBox = true;
    this.showValueBox = false;
    this.setPositionOfSuggestionBox();
  }

  setPositionOfSuggestionBox() {
    setTimeout(function () {
      let searchArea = this.getElementById('search-area');
      let element = this.getElementById('suggestionBoxContainer');
      if (element && searchArea) {
        let topPos = searchArea.offsetTop + searchArea.scrollHeight;
        element.style.top = topPos + 'px';
      }
    }, 100);

  }

  getInnerTextOfAnElement(id) {
    let searchArea = this.getElementById(id);
    let innerText = '';
    if (searchArea) {
      innerText = searchArea['value'];
    }
    return innerText;
  }

  setHeightOfSearchArea() {
    let element = this.getElementById('search-area');
    if (element) {
      this.setHeightWithScrollHieght(element);
    }
  }

  setHeightWithScrollHieght(e) {
    let height = e.scrollHeight;
    if (e) {
      e.style.height = height + 'px';
    }
  }

  getElementById(str) {
    let element = document.getElementById(str);
    return element;
  }

  searchBasedOnWord(word, typOfAction?: any) {
    if (word) {
      this.setListTypeBasedCurrentPosition(word, typOfAction)
    } else {
      this.suggestionList = this.jsonobj['column'];
    }
  }

  getWordsUptoCurrentPosition() {
    var text = this.getElementById("search-area");
    let textValue = text['value'];
    var caretPos = this.getCaretPosition(text);
    if (textValue) {
      textValue = textValue.trim();
    }
    let preText = textValue.substring(0, caretPos);
    let words = this.getPreviousWords(preText);
    return words;
  }

  setSuggestionListWithSearchWord(text) {
    let list = (this.suggestionList || []).filter(obj => {
      text = this.getLowerCaseValue(text);
      let key = this.getLowerCaseValue(obj.name);
      return (this.isMatchedVal(key, text));
    });
    this.suggestionList = list;
  }

  isMatchedVal(key, text) {
    let flag = (key.indexOf(text) !== -1) ? true : false;
    return flag;
  }

  getLowerCaseValue(val) {
    if (val) {
      val = val.toLowerCase();
    }
    return val;
  }

  getCaretPosition(ctrl) {
    var CaretPos = 0;   // IE Support
    if (document['selection'] && ctrl) {
      ctrl.focus();
      var Sel = document['selection'].createRange();
      Sel.moveStart('character', -ctrl.value.length);
      CaretPos = Sel.text.length;
    }
    // Firefox support
    else if (ctrl && ctrl.selectionStart || ctrl.selectionStart == '0')
      CaretPos = ctrl.selectionStart;
    return (CaretPos);
  }

  getPreviousWords(preText) {
    if (preText) {
      preText = preText.trim();
    }
    let words;
    words = preText.split(' ');
    words = this.removeEmptySpaces(words);
    words = this.getWithQuotedText(words);
    return words;
  }

  removeEmptySpaces(words) {
    words = words.filter((word) => {
      return word !== '';
    })
    return words;
  }

  getWithQuotedText(words) {
    let array = [];
    let isStartQuotedTextFound = false;
    let quotedText = '';
    let length = words.length;
    let isEndQuotedTextFound = false;
    if (words && words.length > 0) {
      words.forEach((str, index) => {
        if (!isStartQuotedTextFound) {
          isStartQuotedTextFound = str.startsWith('"');
          if (!isStartQuotedTextFound) {
            array.push(str);
          } else {
            quotedText = str;
            if (length - 1 === index) {
              array.push(quotedText);
              quotedText = '';
            }
          }
        } else {
          isEndQuotedTextFound = false;
          isEndQuotedTextFound = str.endsWith('"');
          if (!isEndQuotedTextFound) {
            if (quotedText === '') {
              quotedText = str;
            } else {
              quotedText = quotedText + ' ' + str;
            }
            if (length - 1 === index) {
              array.push(quotedText);
              quotedText = '';
            }

          } else if (isEndQuotedTextFound) {
            quotedText = quotedText + ' ' + str;
            array.push(quotedText);
            quotedText = '';
            isStartQuotedTextFound = false;
          }

        }

      });
    }
    return array;
  }

  /** adds the keydown event on  docuement */
  addKeydownEventOnDocument() {
    document.onkeydown = (event) => {
      if (event.which == 38 || event.which == 40) {
        this.handleArrowKeysOnList(event);
      }
    };
  }

  handleArrowKeysOnList(event) {
    switch (event.which) {
      case 38:
        this.handleUpArrow(event);
        break;
      case 40:
        this.handleDownArrow(event);
        break;
    }

  }

  handleDownArrow(event) {
    event.preventDefault();
    this.lastIndex = this.lastIndex + 1;
    this.addHighLightClass(this.lastIndex, '#suggestion-list-element', 'down');

  }


  handleUpArrow(event) {
    event.preventDefault();
    this.lastIndex = this.lastIndex - 1;
    this.addHighLightClass(this.lastIndex, '#suggestion-list-element', 'up');
  }

  addHighLightClass(index, selector, direction) {
    let elements = this.getListElements(selector);
    if (elements && index >= 0 && elements[index]) {
      if (index > 0 && direction === 'down' && elements[index - 1]) {
        elements[index - 1].classList.remove('highlight');
      } else if (index >= 0 && direction === 'up' && elements[index + 1]) {
        elements[index + 1].classList.remove('highlight');
      }
      elements[index].classList.add("highlight");
      elements[index].tabIndex = 1;
      elements[index].focus();
    }
  }

  getListElements(str) {
    let elements = document.querySelectorAll(str);
    return elements;
  }

  selectListElement = function (col) {
    this.showSuggestionBox = false;
    let str = col.name;
    if (this.searchCriteria === '') {
      this.searchCriteria = this.searchCriteria + str;
    } else {
      this.searchCriteria = this.replaceWithSelection(str);
    }
    this.validateSearchCriteria();
    setTimeout(() => {
      this.setHeightOfSearchArea();
      this.placeCaretAtEnd(str);
    }, 100)
  }

  formateListItem(str) {
    let arr, finalStr = '';
    if (str) {
      arr = str.split(' ');
      finalStr = (arr.length > 1) ? '"' + arr.join(' ') + '"' : str;
    }
    return finalStr;
  }

  replaceWithSelection(selectedSuggestion) {
    let text = this.getInnerTextOfAnElement('search-area');
    let totalWords = this.getPreviousWords(text);
    let replacedText = text;
    let length = this.currentWordInfo['words'].length;
    if (totalWords.length > 0) {
      if (this.currentWordInfo['lastAction'] === 'Space') {
        if (this.currentWordInfo['wordReplacement']) {
          totalWords[length - 1] = selectedSuggestion;
          replacedText = totalWords.join(' ');
        } else {
          totalWords.splice(length, 0, selectedSuggestion);
          replacedText = totalWords.join(' ');
        }
      } else {
        totalWords[length - 1] = selectedSuggestion;
        replacedText = totalWords.join(' ');
      }
    }
    return replacedText;
  }

  setListTypeBasedCurrentPosition(word, typOfAction) {
    let type;
    this.searchCriteria = this.trimValue(this.searchCriteria);
    if (typOfAction === 'Space') {
      type = this.getTypeOfList();
      this.checkAndEnableValueBox(type);
    } else {
      let wordsMetaData = this.currentWordInfo['wordsMetaData'];
      let length = wordsMetaData.length;
      let currentWordMetaData = (length > 0) ? wordsMetaData[length - 1] : {};
      type = currentWordMetaData.type;
    }
    if (type === 'arithmeticOperator') {
      this.setArithmeticOperatorList(type, typOfAction);
    } else {
      this.suggestionList = this.jsonobj[type] || [];
    }
  }

  checkAndEnableValueBox(type) {
    if (type === 'value') {
      this.showValueBox = true;
      this.showSuggestionBox = false;
      let length = this.currentWordInfo['wordsMetaData'].length;
      let col = this.currentWordInfo['wordsMetaData'][length - 2];
      let arOperator = this.currentWordInfo['wordsMetaData'][length - 1];
      this.typeOfValue = (col && col.columnDataType) ? col.columnDataType : 'text';
      this.typeOfArithemeticOperator = (arOperator && arOperator.key) ? arOperator.key : arOperator.name;
      if (col) {
        this.columnKey = col.key || col.name;
      }
      this.emptyLastValueInInputBox();
      this.assignLookUpValues(col);
    }
  }

  emptyLastValueInInputBox() {
    if (this.isContains(this.typeOfValue, ['timestamp', 'between'])) {
      if (this.isContains(this.typeOfArithemeticOperator, ['between', 'NT_bw'])) {
        this.emptyTheSearchModel('-From');
        this.emptyTheSearchModel('-To');
      } else {
        this.emptyTheSearchModel();
      }
    } else {
      this.emptyTheSearchModel();
    }
  }

  emptyTheSearchModel(str?: any) {
    str = (str) ? str : '';
    if (this.searchObj[this.columnKey + str]) {
      this.searchObj[this.columnKey + str] = '';
    }
  }

  isContains(val, list) {
    let index = list.findIndex(listItem => {
      return listItem == val
    });
    let flag = (index != -1) ? true : false;
    return flag;
  }

  setArithmeticOperatorList(type, typeOfAction) {
    let columnInfo = this.getDataTypeOfColumn(typeOfAction);
    let arOperatorList;
    if (columnInfo) {
      arOperatorList = (this.jsonobj[type] || []).filter(obj => {
        let colDataType = this.getColDataType(columnInfo);
        let index = obj.allowedTo.indexOf(colDataType);
        return (index === -1) ? false : true;
      });
    }
    this.suggestionList = (arOperatorList && arOperatorList.length > 0) ? arOperatorList : this.jsonobj[type];
  }

  /** returns the column type in current obj */
  getColDataType(col) {
    let type = (col && col.columnDataType) ? col.columnDataType : 'text';
    if (type === 'location') {
      type = 'between';
    }
    return type;
  }

  getDataTypeOfColumn(typeOfAction) {
    let lastItem;
    let words = this.currentWordInfo['words'];
    let length = words.length;
    if (typeOfAction === 'Space') {
      lastItem = words[length - 1];
    } else {
      lastItem = words[length - 2];
    }

    let columnInfo = this.jsonobj['column'].find((col) => {
      return (this.getLowerCaseValue(col.name) === this.getLowerCaseValue(lastItem))
    });

    return columnInfo;
  }

  trimValue(value) {
    let trimmedVal = '';
    if (value) {
      trimmedVal = value.trim();
    }
    return trimmedVal;
  }

  getTypeOfList() {
    let type = 'column';
    if (this.searchCriteria === '') {
      type = 'column';
      return type;
    }
    type = this.searchAndFindTypeOfList();

    return type;
  }

  searchAndFindTypeOfList() {
    let list = [{ type: 'startParanthesis', next: 'column' },
    { type: 'column', next: 'arithmeticOperator' },
    { type: 'arithmeticOperator', next: 'value' },
    { type: 'value', next: 'logicalOperator' },
    { type: 'endParanthesis', next: 'logicalOperator' },
    { type: 'logicalOperator', next: 'column' }]
    let obj = list.find(listItem => {
      let wordsMetaData = this.currentWordInfo['wordsMetaData'];
      let length = wordsMetaData.length;
      let currentWordMetaData = wordsMetaData[length - 1];
      return (listItem.type === currentWordMetaData.type) ? true : false;
    });
    let type = (obj) ? obj.next : 'column';
    return type;
  }

  /** formates the date obj and update with search obj  */
  formateDateObj(event, type?: any) {
    if (!type) {
      type = '';
    }
    let value = this.searchObj[this.columnKey + type];
    value = value.getFullYear() + '-' + this.prefixWithZero(value.getMonth() + 1) + '-' + this.prefixWithZero(value.getDate());
    this.searchObj[this.columnKey + type] = value;
  }

  /** prefix with 0 for below 9 */
  prefixWithZero(value) {
    if (value < 10) {
      value = '0' + value;
    }
    return value;
  }

  submitValueOnEnter(event) {
    if (event['code'] === 'Enter') {
      this.saveValue(event);
    }
  }

  saveValue(event) {
    event.stopPropagation();
    this.showValueBox = false;
    if (this.currentWordInfo['lastAction'] === 'Space') {
      let value = this.getFormatedValue();
      if (!value) {
        console.log(this.plsEnterValue);
        return false;
      }
      this.currentWordInfo['words'].push(value);
      this.updateSearchCriteriaWithValue();
    }
    this.validateSearchCriteria();
    setTimeout(() => {
      this.setHeightOfSearchArea();
      this.placeCaretAtEnd();
    }, 100)
  }

  updateSearchCriteriaWithValue() {
    let length = this.currentWordInfo['words'].length;
    let words = this.getPreviousWords(this.searchCriteria);
    words.splice(0, length - 1);
    let totalWords = this.currentWordInfo['words'].concat(words);
    this.searchCriteria = totalWords.join(' ');
  }

  /** updates current object with formated value   */
  getFormatedValue() {
    let value = this.searchObj[this.columnKey] || '';
    if (value && Array.isArray(value)) {
      value = '(' + value.join(',') + ')';
    } else if (this.checkForRangeValues()) {
      value = this.getValueForRangeType();
    }
    return value
  }

  /** returns the formated range values  */
  getValueForRangeType() {
    let fromValue, toValue, finalValue;
    let length = this.currentWordInfo['wordsMetaData'].length;
    let arOperator = this.currentWordInfo['wordsMetaData'][length - 1];
    if (arOperator && (arOperator.key === 'between' || arOperator.key === 'NT_bw')) {
      fromValue = this.searchObj[this.columnKey + '-From'];
      toValue = this.searchObj[this.columnKey + '-To'];
      finalValue = "(" + fromValue + ',' + toValue + ")";
    } else {
      finalValue = this.searchObj[this.columnKey];
    }
    return finalValue;
  }

  /** checks range value or not and returns the boolean data type  */
  checkForRangeValues() {
    let flag = false;
    let arr = ['between', 'timestamp'];
    const obj = arr.find(type => {
      return type === this.typeOfValue;
    });
    if (obj) {
      flag = true;
    }
    return flag;
  }

  /**  allows only numaric only on key up */
  allowNumaricsOnly(event, type?: any) {
    let value;
    if (!type) {
      type = '';
    }
    value = this.searchObj[this.columnKey + type];
    const flag = /^[-.0-9]*$/.test(value);
    if (!flag) {
      value = (value || '').replace(/[^\d.-]/g, '');
      this.searchObj[this.columnKey + type] = value;
    }
    // if (type === '-To' && value) {
    //     this.submitValueOnEnter(event);
    // }
  }

  /**  get selected values from the lookup values and update the search object */
  selectedSuggestionLookup(item) {
    item.selected = !item.selected;
    let arr = this.getFilterdItems(this.listOfLookUpValues, 'selected');
    this.searchObj[this.columnKey] = arr.map(arr => {
      return arr.value;
    });
  }

  /**  get selected values from the lookup values  */
  getFilterdItems(arr, attr) {
    let list = arr.filter(item => {
      if (attr && item[attr]) {
        return item[attr];
      } else {
        return false;
      }
    });

    return list;
  }


  /** assigns to lookupvalues list array with current lookup values */
  assignLookUpValues(col) {
    if (this.typeOfValue === 'dropdown' && col) {
      let key = (col.key) ? col.key : col.name;
      this.listOfLookUpValues = this[key];
      this.convertToListOfObj();
    }
  }

  /** converts the list of strings to list of objects */
  convertToListOfObj() {
    this.listOfLookUpValues = this.listOfLookUpValues.map(value => {
      let obj = {}
      obj['value'] = value;
      obj['selected'] = false;
      return obj;
    })
  }

  validateSearchCriteria() {
    let words = this.getPreviousWords(this.searchCriteria);
    let wordsMetaData = this.getMetaDataOfWords(words);
    let isValidSeachCriteria = true;

    wordsMetaData.forEach((word, index) => {
      if (isValidSeachCriteria) {
        let nextWord = wordsMetaData[index + 1];
        let hasNextWord = (nextWord) ? true : false;
        if ((word.type !== 'value' && word.type !== 'endParanthesis') && !hasNextWord) {
          isValidSeachCriteria = false;
        } else if ((word.type === 'value' || word.type === 'endParanthesis')) {
          isValidSeachCriteria = this.validateValue(word, isValidSeachCriteria)
          if (isValidSeachCriteria && hasNextWord) {
            isValidSeachCriteria = this.checkWithnextWord(word, nextWord);
          }
        } else if (hasNextWord) {
          isValidSeachCriteria = this.checkWithnextWord(word, nextWord);
          isValidSeachCriteria = this.isValidOperators(isValidSeachCriteria, index, wordsMetaData);
          isValidSeachCriteria = this.isValidColumn(isValidSeachCriteria, word);
          isValidSeachCriteria = this.checkWithNullValue(isValidSeachCriteria, word, nextWord);
        }
      }
    });

    isValidSeachCriteria = this.checkWithParanthesis(isValidSeachCriteria, wordsMetaData)
    this.statusOfSearchCriteria = isValidSeachCriteria;
  }

  checkWithNullValue(isValidSeachCriteria, word, nextWord) {
    if (isValidSeachCriteria && word.type === "arithmeticOperator") {
      if (word.key === 'IS' || word.key === 'IS_NOT') {
        isValidSeachCriteria = (nextWord.name === 'null') ? true : false;
      } else {
        isValidSeachCriteria = (nextWord.name !== 'null') ? true : false;
      }
    }
    return isValidSeachCriteria;
  }

  validateValue(word, isValidSeachCriteria) {
    if (word && word.type === 'value') {
      if (isValidSeachCriteria && word && word.dataType === 'number') {
        isValidSeachCriteria = !isNaN(word.name);
      }
      if (isValidSeachCriteria) {
        const keys = this.jsonobj.restrictedKeys.keys;
        const flag = keys.some(str => {
          const index = (word.name || '').indexOf(str);
          return (index !== -1)
        })
        isValidSeachCriteria = !flag;
      }
      if (isValidSeachCriteria) {
        const arOperators = this.jsonobj.restrictedKeys.operators;
        const flag = arOperators.some(str => {
          return (word.name === str) ? true : false;
        })
        isValidSeachCriteria = !flag;
      }
      if (isValidSeachCriteria) {
        if (word.name.startsWith('"')) {
          isValidSeachCriteria = false;
          if (word.name.endsWith('"')) {
            isValidSeachCriteria = true;
          }
        }
      }
      if (isValidSeachCriteria) {
        if (word.name.startsWith("'")) {
          isValidSeachCriteria = false;
          if (word.name.endsWith("'")) {
            isValidSeachCriteria = true;
          }
        }
      }

    }
    return isValidSeachCriteria;
  }

  checkWithParanthesis(isValidSeachCriteria, wordsMetaData) {
    if (isValidSeachCriteria) {
      let startParanthesisLength = wordsMetaData.filter(word => {
        return (word.name === '(')
      }).length;

      let endParanthesisLength = wordsMetaData.filter(word => {
        return (word.name === ')')
      }).length;

      isValidSeachCriteria = (startParanthesisLength === endParanthesisLength) ? true : false;
    }

    return isValidSeachCriteria;
  }

  isValidOperators(isValidSeachCriteria, index, wordsMetaData) {
    if (isValidSeachCriteria) {
      let word = wordsMetaData[index];
      let type = word.type;
      if (type === 'arithmeticOperator') {
        isValidSeachCriteria = this.isValidArithmeticOperator(wordsMetaData, index)
      } else if (type === 'logicalOperator') {
        let arr = this.jsonobj[type];
        isValidSeachCriteria = this.isExist(arr, word.name, 'name');
      }
    }
    return isValidSeachCriteria;
  }

  isValidColumn(isValidSeachCriteria, word) {
    if (isValidSeachCriteria && word && word.type === 'column') {
      let str = word.name;
      let index = str.indexOf("(");
      index = (index == -1) ? str.indexOf(")") : index;
      let flag = (index == -1) ? true : false;
      isValidSeachCriteria = flag;
    }
    return isValidSeachCriteria
  }

  isValidArithmeticOperator(wordsMetaData, index) {
    let word = wordsMetaData[index];
    let type = word.type;
    let str = word.name;
    let col = wordsMetaData[index - 1];
    let colDataType = col.columnDataType;
    let list = this.jsonobj[type];
    let obj = this.getMatchedValue(list, str, 'name');
    let flag = (obj) ? true : false;
    if (flag) {
      let arr = obj.allowedTo;
      flag = this.isExist(arr, colDataType);
    }
    return flag;
  }

  isExist(arr, str, attr?: any) {
    let obj = this.getMatchedValue(arr, str, attr);
    let flag = (obj) ? true : false;
    return flag;
  }

  getMatchedValue(arr, str, attr) {
    let obj = arr.find(item => {
      if (attr) {
        return this.getLowerCaseValue(item[attr]) === this.getLowerCaseValue(str);
      } else {
        return this.getLowerCaseValue(item) === this.getLowerCaseValue(str);
      }
    });
    return obj;
  }

  checkWithnextWord(word, nextWord) {
    let list = [{ type: 'startParanthesis', next: 'column' },
    { type: 'column', next: 'arithmeticOperator' },
    { type: 'arithmeticOperator', next: 'value' },
    { type: 'value', next: ['logicalOperator', 'endParanthesis'] },
    { type: 'endParanthesis', next: 'logicalOperator' },
    { type: 'logicalOperator', next: ['column', 'startParanthesis'] }];

    let type = word.type
    let nextType = nextWord.type;
    let obj = list.find(listItem => {
      return (listItem.type === type);
    });
    let flag;
    if (Array.isArray(obj.next)) {
      let text = obj.next.find(item => {
        return (item === nextType);
      })
      flag = (text) ? true : false;
    } else {
      flag = (obj.next === nextType);
    }
    return flag;
  }

  clickedOnSearchCriteria() {
    this.handleEnterEvent();
  }

  clickedOnClearCriteria() {
    this.searchCriteria = '';
  }


  placeCaretAtEnd(str?: any) {
    let searchArea = this.getElementById('search-area');
    var CaretPos = 0;
    // IE Support

    // if (document['selection']) {
    //   searchArea.focus();
    //   var Sel = document['selection'].createRange();
    //   Sel.moveStart('character', searchArea['selectionStart']);
    //   CaretPos = Sel.text.length;
    // }
    // Firefox support
    // else 
    if (searchArea['selectionStart'] || searchArea['selectionStart'] == '0')
      CaretPos = this.getCurrentWordText(str).length || searchArea['selectionStart'];

    //update The cursor position 
    this.setCaretPosition(searchArea, CaretPos);
  }

  getCurrentWordText(str) {
    let text = '';
    let words = this.currentWordInfo['words'];
    text = words.join(' ');
    if (str) {
      text = text + ' ' + str;
    }
    return text;
  }

  setCaretPosition(searchArea, pos) {

    if (searchArea.setSelectionRange) {
      searchArea.focus();
      searchArea.setSelectionRange(pos, pos);
    }
    else if (searchArea.createTextRange) {
      var range = searchArea.createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
  }


}
