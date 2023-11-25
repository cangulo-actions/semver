# {{ version }} {{ title }}

{% if changesPerReleaseType['major'] -%}
## breaking changes:
{% for change in changesPerReleaseType['major'] -%}
* {{ change.originalCommit }}
{% endfor -%}
{% endif -%}

{% if changesPerReleaseType['minor'] -%}
## new features:
{% for change in changesPerReleaseType['minor'] -%}
* {{ change.originalCommit }}
{% endfor -%}
{% endif -%}

{% if changesPerReleaseType['patch'] -%}
## patches:
{% for change in changesPerReleaseType['patch'] -%}
* {{ change.originalCommit }}
{% endfor -%}
{% endif -%}

{% if changesPerReleaseType['none'] -%}
## others
{% for change in changesPerReleaseType['none'] -%}
* {{ change.originalCommit }}
{% endfor -%}
{% endif -%}
