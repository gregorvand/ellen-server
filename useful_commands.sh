node edisonToIndexedByYear.js
node companyToIndexed.js -l
makemigrations --name 'add-dummy-indexedCompany'
node postValidateFlow.js
node dailyUpdate.js
./ngrok http -subdomain=ellen-webhook 8000