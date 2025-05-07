<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>

  <xsl:template match="/">
    <section class="mt-5">
      <h2 class="mb-4">Popular Player Stats</h2>
      <div class="row">
        <!-- XSLT  -->
        <xsl:for-each select="players/player">
          <div class="col-md-4 mb-4">
            <div class="card">
              <img src="image" class="card-img-top" alt="name"/>
              <div class="card-body">
                <h5 class="card-title">
                  <xsl:value-of select="name"/>
                </h5>
                <p class="card-text">
                  Avg. Points: <xsl:value-of select="avgPoints"/><br/>
                  Rebounds: <xsl:value-of select="rebounds"/><br/>
                  Assists: <xsl:value-of select="assists"/>
                </p>
                <a href="player-detail.html" class="btn btn-primary">View Details</a>
              </div>
            </div>
          </div>
        </xsl:for-each>
      </div>
    </section>
  </xsl:template>
</xsl:stylesheet>