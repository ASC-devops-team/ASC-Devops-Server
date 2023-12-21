docker stop employee_portal_container
docker rm employee_portal_container
docker rmi employee_portal_img

docker build -t employee_portal_img .
docker run --restart unless-stopped -d -p 9000:9000 --name employee_portal_container employee_portal_img
docker image prune -f
