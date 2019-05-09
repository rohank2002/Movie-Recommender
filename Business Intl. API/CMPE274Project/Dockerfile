FROM python:3
COPY . ./
WORKDIR /
RUN pip install flask
RUN pip install pandas
ENTRYPOINT ["python"]
CMD ["server.py"]


