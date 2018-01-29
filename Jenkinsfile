@Library('deployment') _
import org.mapcreator.Deploy

node('npm && grunt') {
	stage('checkout') {
		checkout scm
	}

	stage('build') {
		sh 'npm install'
		sh 'grunt production'
		sh 'rm -rf node_modules'
	}

	if(BRANCH_NAME in ['develop', 'master']) {
		def deploy = new Deploy(steps)

		deploy.initialize(
			'/var/www/',
			'maps4news-interactive',
			BRANCH_NAME == 'master' ? 'beta' : 'bleeding',
			BUILD_NUMBER,
			'f206c873-8c0b-481e-9c72-1ecb97a5213a',
			'deploy',
			BRANCH_NAME == 'master' ? '54.246.191.92' : '10.58.32.50',
			false
		)

		deploy.prepare()
		deploy.copy('./*')

		deploy.finish([], [], [])
	}
}

// vim: set ft=groovy:
