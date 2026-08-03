pipeline {
    agent any

    options {
        // Không cho nhiều pipeline chạy chồng lên nhau
        disableConcurrentBuilds(abortPrevious: true)
    }

    environment {
        DOCKER_IMAGE = "anhkv97/sample-ci-app"
        DEPLOYMENT_FILE = "k8s/deployment.yaml"
        SKIP_PIPELINE = "false"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Detect changes') {
            steps {
                script {
                    def commitMessage = sh(
                        script: 'git log -1 --pretty=%B',
                        returnStdout: true
                    ).trim()

                    def changedFiles = sh(
                        script: 'git diff-tree --no-commit-id --name-only -r HEAD',
                        returnStdout: true
                    ).trim()

                    echo "Commit message:"
                    echo commitMessage

                    echo "Changed files:"
                    echo changedFiles

                    def files = changedFiles
                        .split('\n')
                        .findAll { it?.trim() }

                    def onlyK8sChanged =
                        !files.isEmpty() &&
                        files.every { it.startsWith('k8s/') }

                    if (
                        commitMessage.contains('[skip ci]') ||
                        onlyK8sChanged
                    ) {
                        env.SKIP_PIPELINE = "true"
                        echo "Commit chỉ cập nhật manifest Kubernetes. Bỏ qua CI để tránh vòng lặp."
                    } else {
                        echo "Có thay đổi source hoặc cấu hình build. Tiếp tục pipeline."
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
                      --volumes-from "$HOSTNAME" \
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
                      --volumes-from "$HOSTNAME" \
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
                        echo "$DOCKERHUB_TOKEN" |
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
                    echo "Manifest trước khi cập nhật:"
                    grep "image:" ${DEPLOYMENT_FILE}

                    sed -i \
                      "s|image: ${DOCKER_IMAGE}:.*|image: ${DOCKER_IMAGE}:${BUILD_NUMBER}|" \
                      ${DEPLOYMENT_FILE}

                    echo "Manifest sau khi cập nhật:"
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
                            echo "Manifest không thay đổi."
                        else
                            git commit \
                              -m "Update image to ${DOCKER_IMAGE}:${BUILD_NUMBER} [skip ci]"

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
                    echo "Pipeline đã bỏ qua vì commit chỉ cập nhật thư mục k8s."
                } else {
                    echo "CI hoàn thành."
                    echo "Đã push image ${DOCKER_IMAGE}:${BUILD_NUMBER}."
                    echo "ArgoCD sẽ tự triển khai phiên bản mới."
                }
            }
        }

        failure {
            echo "Pipeline thất bại. Kiểm tra Console Output."
        }

        always {
            sh 'docker image prune -f || true'
        }
    }
}
