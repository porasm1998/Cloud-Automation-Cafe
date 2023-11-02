pipeline {
    agent any 

    tools {
        nodejs 'NodeJS_16.2.0' // Assuming you have configured Node.js 16.2.0 in Global Tool Configuration
    }
    
    stages {
        stage('Install Dependencies') {
            steps {
                script {
                    bat 'npm ci --force'
                }
            }
        }

      

        // Additional stages as per your requirements
    }
    
    post {
        always {
            cleanWs()
        }
    }
}
