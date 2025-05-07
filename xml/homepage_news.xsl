<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>

  <!-- carousel -->
  <xsl:template match="/">
    <div id="newsCarousel" class="carousel slide" data-bs-ride="carousel">
      <div class="carousel-inner">
        <!-- XSLT carousel items -->
        <xsl:for-each select="newsItems/newsItem">
          <div class="carousel-item">
            <xsl:if test="position() = 1">
              <xsl:attribute name="class">carousel-item active</xsl:attribute>
            </xsl:if>
            <img src="image" class="d-block w-100" alt="title"/>
            <div class="carousel-caption d-none d-md-block">
              <h5><xsl:value-of select="title"/></h5>
              <p><xsl:value-of select="description"/></p>
            </div>
          </div>
        </xsl:for-each>
      </div>
    </div>
  </xsl:template>
</xsl:stylesheet>