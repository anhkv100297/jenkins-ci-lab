pipeline {
    agent any

    environment {
        IMAGE_NAME = "sample-ci-app"
        CONTAINER_NAME = "sample-ci-app"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies & Test') {
            // Jenkins sẽ tự động mount workspace hiện tại vào container node này
            agent {
                docker {
                    image 'node:20-alpine'
                    reuseNode true
                }
            }
            steps {
                sh 'npm install'
                sh 'npm test'
            }
        }

        stage('Build Docker image') {
            steps {
                sh 'docker build -t $IMAGE_NAME:$BUILD_NUMBER .'
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    docker rm -f $CONTAINER_NAME || true
                    docker run -d \
                      --name $CONTAINER_NAME \
                      -p 3000:3000 \
                      --restart unless-stopped \
                      $IMAGE_NAME:$BUILD_NUMBER
                '''
            }
        }
    }

    post {
        success {
            echo 'Build and deployment completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Review the console output.'
        }
    }
}
