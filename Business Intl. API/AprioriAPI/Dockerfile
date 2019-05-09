FROM python:3
COPY . ./
WORKDIR /
RUN pip install flask
RUN pip install pandas
RUN pip install efficient_apriori
ENTRYPOINT ["python"]
CMD ["server.py"]


