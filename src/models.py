from google.appengine.ext import ndb

class List(ndb.Model):
    master_token = ndb.StringProperty()
    name = ndb.StringProperty()
