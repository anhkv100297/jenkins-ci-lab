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

        stage('Install dependencies') {
            steps {
                // Sửa thành jenkins-ci-lab_jenkins_home
                sh "docker run --rm --volumes-from \$HOSTNAME -w ${WORKSPACE} node:20-alpine npm install"
            }
        }

        stage('Test') {
            steps {
                sh "docker run --rm --volumes-from \$HOSTNAME -w ${WORKSPACE} node:20-alpine npm test"
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
                # 1. Dừng và xóa Container cũ (nếu đang chạy) để giải phóng Port
                docker rm -f $CONTAINER_NAME || true
            
                # 2. Chạy Container mới với Image vừa được build xong
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
