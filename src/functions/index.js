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
  const amountSpent = params.amountSpent;
  if (conv.user.storage.expenses)  conv.user.storage.expenses = parseFloat(conv.user.storage.expenses) + parseFloat(amountSpent);
  else conv.user.storage.expenses = amountSpent;
  conv.ask(`Added ${amountSpent} ${conv.user.storage.defaultCurrency} to your expenses. 
  Your total expenses this month are ${conv.user.storage.expenses}. 
  Would you like to add more ?`);
  conv.ask(new Suggestions('Yes', 'No'));
});


app.intent('Add expense - yes', (conv, params) => {
  const amountSpent = params.amountSpent;
  if (conv.user.verification === 'VERIFIED') conv.user.storage.expenses = parseFloat(conv.user.storage.expenses) + parseFloat(amountSpent);
  conv.ask(`Added ${amountSpent} ${conv.user.storage.defaultCurrency} to your expenses. 
  Your total expenses this month are ${conv.user.storage.expenses}. 
  Would you like to add more ? `);
  conv.ask(new Suggestions('Yes', 'No'));
});


app.intent('Add income', (conv, params) => {
  const amountEarned = params.amountEarned;
  if (conv.user.storage.income) conv.user.storage.income = parseFloat(conv.user.storage.expenses) + parseFloat(amountEarned);
  else conv.user.storage.income = amountEarned;
  conv.ask(`Added ${amountEarned} ${conv.user.storage.defaultCurrency} to your income! You now have ${conv.user.storage.income} of income. 
  Would you like to add more?`);
  conv.ask(new Suggestions('Yes', 'No'));
});


app.intent('Add income - yes', (conv, params) => {
  const amountEarned = params.amountEarned;
  if (conv.user.verification === 'VERIFIED') conv.user.storage.income = parseFloat(conv.user.storage.expenses) + parseFloat(amountEarned);
  conv.ask(`Added ${amountEarned} ${conv.user.storage.defaultCurrency} to your income! You now have ${conv.user.storage.income} of income. Would you like to add more?`);
  conv.ask(new Suggestions('Yes', 'No'));
});

app.intent('get.report', (conv, params) => {
  if (conv.user.storage.expenses || conv.user.storage.income) {
    const balance = conv.user.storage.income - conv.user.storage.expenses;
    conv.close(`From ${moment(params.datePeriod.startDate).format("MMM Do YY")} to ${moment(params.datePeriod.endDate).format("MMM Do YY")} you have spent ${conv.user.storage.expenses} ${conv.user.storage.defaultCurrency} and you have earned ${conv.user.storage.income} ${conv.user.storage.defaultCurrency}. 
    Your balance is ${balance}`);
    // conv.ask(`Do you want me to send this to your email?`);
    // conv.ask(new Suggestions('Yes', 'No'));
  } else {
    conv.close(`You have not added any income or expenses!`);
  }

});

app.intent('get.report - yes', (conv, params) => {
  if (conv.user.profile) {
    conv.close(`I will send the report to ${conv.user.profile.payload.email}. Please check in a few moments.`);
  } else {
    conv.ask(new SignIn('To be able to send you the report'));
  }
});

app.intent('get.report - yes - followup', (conv, params, signin) => {
  if(signin.status === 'OK') {
    const payload = conv.user.profile.payload;
    conv.ask(`OK. I will send the report to ${payload.email}. Please check in a few moments.`);
  } else {
    conv.close('I cannot send you the report if you are not signed in. Please try again later!');
  }
})

app.intent('clear.data', conv => {
  conv.user.storage = {};
  conv.ask('Ok. Your data has been deleted!');
  conv.ask('Do you need anything else?');
  conv.ask(new Suggestions('Add expense', 'Add income', 'Get report'));
})

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);

