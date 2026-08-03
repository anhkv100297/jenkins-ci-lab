pipeline {
    agent any

    environment {
        // Docker Hub image đầy đủ
        DOCKER_IMAGE = "anhkv97/sample-ci-app"

        // File manifest mà ArgoCD đang theo dõi
        DEPLOYMENT_FILE = "k8s/deployment.yaml"

        // Cờ tránh Jenkins tự chạy lặp lại khi chính Jenkins cập nhật manifest
        SKIP_PIPELINE = "false"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check commit') {
            steps {
                script {
                    def commitMessage = sh(
                        script: 'git log -1 --pretty=%B',
                        returnStdout: true
                    ).trim()

                    echo "Commit message: ${commitMessage}"

                    if (commitMessage.contains('[skip ci]')) {
                        env.SKIP_PIPELINE = "true"
                        echo "Phát hiện [skip ci]. Bỏ qua build để tránh pipeline chạy lặp."
                    }
                }
            }
        }

        stage('Install dependencies') {
            when {
                expression {
                    env.SKIP_PIPELINE != "true"
                }
            }

            steps {
                sh '''
                    docker run --rm \
                      --volumes-from $HOSTNAME \
                      -w "$WORKSPACE" \
                      node:20-alpine \
                      npm install
                '''
            }
        }

        stage('Test') {
            when {
                expression {
                    env.SKIP_PIPELINE != "true"
                }
            }

            steps {
                sh '''
                    docker run --rm \
                      --volumes-from $HOSTNAME \
                      -w "$WORKSPACE" \
                      node:20-alpine \
                      npm test
                '''
            }
        }

        stage('Build Docker image') {
            when {
                expression {
                    env.SKIP_PIPELINE != "true"
                }
            }

            steps {
                sh '''
                    docker build \
                      -t ${DOCKER_IMAGE}:${BUILD_NUMBER} \
                      -t ${DOCKER_IMAGE}:latest \
                      .
                '''
            }
        }

        stage('Push Docker image') {
            when {
                expression {
                    env.SKIP_PIPELINE != "true"
                }
            }

            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub',
                        usernameVariable: 'DOCKERHUB_USERNAME',
                        passwordVariable: 'DOCKERHUB_TOKEN'
                    )
                ]) {
                    sh '''
                        echo "$DOCKERHUB_TOKEN" | \
                          docker login \
                          -u "$DOCKERHUB_USERNAME" \
                          --password-stdin

                        docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}
                        docker push ${DOCKER_IMAGE}:latest

                        docker logout
                    '''
                }
            }
        }

        stage('Update Kubernetes manifest') {
            when {
                expression {
                    env.SKIP_PIPELINE != "true"
                }
            }

            steps {
                sh '''
                    echo "Image trước khi cập nhật:"
                    grep "image:" ${DEPLOYMENT_FILE}

                    sed -i \
                      "s|image: ${DOCKER_IMAGE}:.*|image: ${DOCKER_IMAGE}:${BUILD_NUMBER}|" \
                      ${DEPLOYMENT_FILE}

                    echo "Image sau khi cập nhật:"
                    grep "image:" ${DEPLOYMENT_FILE}
                '''
            }
        }

        stage('Push manifest to GitHub') {
            when {
                expression {
                    env.SKIP_PIPELINE != "true"
                }
            }

            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'github-pat',
                        usernameVariable: 'GITHUB_USERNAME',
                        passwordVariable: 'GITHUB_TOKEN'
                    )
                ]) {
                    sh '''
                        git config user.name "Jenkins CI"
                        git config user.email "jenkins@example.local"

                        git add ${DEPLOYMENT_FILE}

                        if git diff --cached --quiet; then
                            echo "Manifest không thay đổi, không cần commit."
                        else
                            git commit -m "Update image to ${DOCKER_IMAGE}:${BUILD_NUMBER} [skip ci]"

                            git push \
                              "https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/anhkv100297/jenkins-ci-lab.git" \
                              HEAD:main
                        fi
                    '''
                }
            }
        }
    }

    post {
        success {
            script {
                if (env.SKIP_PIPELINE == "true") {
                    echo 'Pipeline được bỏ qua vì đây là commit cập nhật manifest của Jenkins.'
                } else {
                    echo "CI hoàn thành thành công."
                    echo "Docker image: ${DOCKER_IMAGE}:${BUILD_NUMBER}"
                    echo "ArgoCD sẽ tự đồng bộ manifest mới vào Kubernetes."
                }
            }
        }

        failure {
            echo 'Pipeline thất bại. Hãy kiểm tra Console Output.'
        }

        always {
            sh 'docker image prune -f || true'
        }
    }
}
