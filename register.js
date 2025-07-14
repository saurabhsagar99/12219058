const fetch = require('node-fetch');

async function registerWithEvaluationService() {
    try {
        console.log('🔐 Registering with Evaluation Service...');
        
        const registrationData = {
            email: "saurabhsagar099@gmail.com",
            name: "Saurabh Sagar",
            mobileNo: "7050286159",
            githubUsername: "saurabhsagar99",
            rollNo: "12219058",
            accessCode: "CZypQK"
        };

        const response = await fetch('http://29.244.56.144/evaluation-service/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registrationData)
        });

        if (!response.ok) {
            throw new Error(`Registration failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('✅ Registration successful!');
        console.log('📋 Registration Details:');
        console.log(`   Email: ${result.email}`);
        console.log(`   Name: ${result.name}`);
        console.log(`   Roll No: ${result.rollNo}`);
        console.log(`   Client ID: ${result.clientID}`);
        console.log(`   Client Secret: ${result.clientSecret}`);
        
        // Save credentials to a file
        const fs = require('fs');
        const credentials = {
            email: result.email,
            name: result.name,
            rollNo: result.rollNo,
            accessCode: result.accessCode,
            clientID: result.clientID,
            clientSecret: result.clientSecret
        };
        
        fs.writeFileSync('credentials.json', JSON.stringify(credentials, null, 2));
        console.log('💾 Credentials saved to credentials.json');
        
        return result;
        
    } catch (error) {
        console.error('❌ Registration failed:', error.message);
        throw error;
    }
}

// Run registration
registerWithEvaluationService().catch(console.error); 