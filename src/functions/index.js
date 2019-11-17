'use strict';
const moment = require('moment');

const {
  dialogflow,
  Permission,
  Suggestions,
  SignIn
} = require('actions-on-google');

const functions = require('firebase-functions');

const app = dialogflow({
  debug: true,
  clientId: '524420071498-7s42ct42dj9qc1sqq9pls7p4pedtok05.apps.googleusercontent.com',
});

app.intent('Default Welcome Intent', conv => {
  if (!conv.user.storage.defaultCurrency) {
    conv.ask(`Hey there. Please choose your default currency to continue.`);
    conv.ask(new Suggestions('USD', 'EUR', 'GBP', 'BGN'));
  } else {
    conv.ask('Do you want to add an expense, add an income or get a report!');
    conv.ask(new Suggestions('Add expense', 'Add income', 'Get a report'));
  }

});

app.intent('Default Welcome Intent - default-currency', (conv, params) => {
  if (conv.user.verification === 'VERIFIED') conv.user.storage.defaultCurrency = params.currency;
  conv.ask(`${params.currency} was added as your default currency.`);
  conv.ask('Do you want to add an expense, add an income or get a report!');
  conv.ask(new Suggestions('Add expense', 'Add income', 'Get a report'));
});

app.intent('Add expense', (conv, params) => {
  const amountSpent = parseFloat(params.amountSpent);
  this.month = moment().format('MMMM');
  this.year = moment().format('YYYY');

  if (conv.user.storage.expenses) {
    conv.user.storage.expenses[this.month] = parseFloat(conv.user.storage.expenses[this.month]) + parseFloat(amountSpent);
    conv.user.storage.expenses[this.year] = parseFloat(conv.user.storage.expenses[this.year]) + parseFloat(amountSpent);
  } else {
    conv.user.storage.expenses = {};
    conv.user.storage.expenses[this.month] = amountSpent;
    conv.user.storage.expenses[this.year] = amountSpent;
  }
  conv.ask(`Added ${amountSpent} ${conv.user.storage.defaultCurrency ? conv.user.storage.defaultCurrency : ''} 
  to your expenses. 
  Your total expenses this month are ${conv.user.storage.expenses[this.month]}. 
  Would you like to add more ?`);
  conv.ask(new Suggestions('Yes', 'No'));
});

app.intent('Add expense - yes', (conv, params) => {
  const amountSpent = parseFloat(params.amountSpent);
  this.month = moment().format('MMMM');
  this.year = moment().format('YYYY');

  conv.user.storage.expenses[this.month] = parseFloat(conv.user.storage.expenses[this.month]) + parseFloat(amountSpent);
  conv.user.storage.expenses[this.year] = parseFloat(conv.user.storage.expenses[this.year]) + parseFloat(amountSpent);

  conv.ask(`Added ${amountSpent} ${conv.user.storage.defaultCurrency ? conv.user.storage.defaultCurrency : ''} 
  to your expenses. 
  Your total expenses this month are ${conv.user.storage.expenses[this.month]}. 
  Would you like to add more ? `);
  conv.ask(new Suggestions('Yes', 'No'));
});


app.intent('Add income', (conv, params) => {
  const amountEarned = parseFloat(params.amountEarned);
  this.month = moment().format('MMMM');
  this.year = moment().format('YYYY');

  if (conv.user.storage.income) {
    conv.user.storage.income[this.month] = parseFloat(conv.user.storage.income[this.month]) + amountEarned; 
    conv.user.storage.income[this.year] = parseFloat(conv.user.storage.income[this.year]) + amountEarned; 
  } else {
    conv.user.storage.income = {};
    conv.user.storage.income[this.month] = amountEarned;
    conv.user.storage.income[this.year] = amountEarned;
  }

  conv.ask(`Added ${amountEarned} ${conv.user.storage.defaultCurrency ? conv.user.storage.defaultCurrency : ''} 
  to your income! This month you have ${conv.user.storage.income[this.month]} of income. 
  Would you like to add more?`);
  conv.ask(new Suggestions('Yes', 'No'));
});

app.intent('Add income - yes', (conv, params) => {
  const amountEarned = parseFloat(params.amountEarned);
  this.month = moment().format('MMMM');
  this.year = moment().format('YYYY');
  conv.user.storage.income[this.month] = parseFloat(conv.user.storage.income[this.month]) + parseFloat(amountEarned);
  conv.user.storage.income[this.year] = parseFloat(conv.user.storage.income[this.year]) + parseFloat(amountEarned);
  conv.ask(`Added ${amountEarned} ${conv.user.storage.defaultCurrency ? conv.user.storage.defaultCurrency : ''} 
  to your income! This month you have ${conv.user.storage.income[this.month]} of income. Would you like to add more?`);
  conv.ask(new Suggestions('Yes', 'No'));
});

app.intent('get.report', (conv, params) => {
  let balance;
  let expense;
  let income;
  let defaultCurrency;
  this.month = moment(params.datePeriod.endDate).format("MMMM");
  this.year = moment(params.datePeriod.endDate).format('YYYY');

  if (conv.user.storage.defaultCurrency) defaultCurrency = conv.user.storage.defaultCurrency;
  else defaultCurrency = '';

  if (!conv.user.storage.expenses && !conv.user.storage.income) {
    conv.close(`You have not added any income or expenses!`);
  }

  if (conv.user.storage.expenses && conv.user.storage.income) {
    expense = conv.user.storage.expenses[this.month];
    income = conv.user.storage.income[this.month];
    balance = income - expense;
  } else if (!conv.user.storage.expenses && conv.user.storage.income) {
    expense = 0;
    income = conv.user.storage.income[this.month];
    balance = conv.user.storage.income[this.month];
  } else if (!conv.user.storage.income && conv.user.storage.expenses) {
    expense = conv.user.storage.expenses[this.month];
    income = 0;
    balance = `-${conv.user.storage.expenses[this.month]}`;
  } else {
    expense = 0;
    income = 0;
    balance = income - expense;
  }

  if (conv.query.includes('year')) {
    income = conv.user.storage.income[this.year];
    expense = conv.user.storage.expenses[this.year];
    balance = parseFloat(conv.user.storage.income[this.year]) - parseFloat(conv.user.storage.expenses[this.year]);
  }
  
  conv.close(`From ${moment(params.datePeriod.startDate).format("MMM Do YY")} to 
  ${moment(params.datePeriod.endDate).format("MMM Do YY")} you have spent 
  ${expense} ${defaultCurrency} and you have earned 
  ${income} ${defaultCurrency}. 
  Your balance is ${balance} ${defaultCurrency}`);
});

app.intent('remove.expense', (conv, params) => {
  this.month = moment().format('MMMM');
  this.year = moment().format('YYYY');
  conv.user.storage.expenses[this.year] = parseFloat(conv.user.storage.expenses[this.year]) - parseFloat(params.amount);
  conv.user.storage.expenses[this.month] = parseFloat(conv.user.storage.expenses[this.month]) - parseFloat(params.amount);
  conv.ask(`Done. I have removed ${params.amount} from your expenses. Your expenses are ${conv.user.storage.expenses[this.month]}. Can i help you with anything else?`)
  conv.ask(new Suggestions('Remove income', 'No', 'Add expense'));
});

app.intent('remove.income', (conv, params) => {
  this.month = moment().format('MMMM');
  this.year = moment().format('YYYY');
  conv.user.storage.income[this.year] = parseFloat(conv.user.storage.income[this.year]) - parseFloat(params.amount);
  conv.user.storage.income[this.month] = parseFloat(conv.user.storage.income[this.month]) - parseFloat(params.amount);
  conv.ask(`Done. I have removed ${params.amount} from your income. Your income is ${conv.user.storage.income[this.month]}. Can i help you with anything else?`);
  conv.ask(new Suggestions('Remove expense', 'No', 'Add income'));
});

app.intent('change.currency', (conv, params) => {
  //TO DO: Here calculate the rate between the new currency and the old one and change the user storage data.
  conv.user.storage.defaultCurrency = params.currency;
  conv.ask(`Done. Your default currency is now ${params.currency}. Do you need anything else?`);
  conv.ask(new Suggestions('Add expense', 'Get report', 'No'));
});

app.intent('clear.data', conv => {
  conv.user.storage = {};
  conv.ask('Ok. Your data has been deleted!');
  conv.ask('Do you need anything else?');
  conv.ask(new Suggestions('Add expense', 'Add income', 'Get report'));
});

app.intent('help', conv => {
  conv.close('I help you keep track of your expenses. You can add an expense, add an income or get a report of your finances.')
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);

