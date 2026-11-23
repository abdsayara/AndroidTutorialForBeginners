# Rules for the release build (R8).
# The app reads JSON by field name with org.json and builds nothing by reflection,
# so little needs keeping. Firebase ships its own rules inside its libraries.

# Keep line numbers so crash reports from the store point to the right place.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# The service that receives the Firebase messages is named in the manifest.
-keep class ps.weather.push.PushService { *; }
# The home-screen widget is named in the manifest.
-keep class ps.weather.widget.** { *; }
