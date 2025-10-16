The public elastic IP address for the EC2 instance is `35.171.103.204`
### To `ssh` into web server: 
`ssh -i <path_to_pem> ubuntu@35.171.103.204` (or `ubuntu@family-tasks.app`)

The domain name for the website is [family-tasks.app](http://family-tasks.app).  
Any subdomains also redirect, such as [example.family-tasks.app](http://example.family-tasks.app).

### To deploy:
`./deployReact.sh -k <path_to_pem> -h family-tasks.app -s startup`

## Technologies
The toolchain that we use for our React project consists of GitHub as the code repository, Vite for JSX, TS, development and debugging support, ESBuild for converting to ES6 modules and transpiling (with Babel underneath), Rollup for bundling and tree shaking, PostCSS for CSS transpiling, and finally a simple bash script (deployReact.sh) for deployment.