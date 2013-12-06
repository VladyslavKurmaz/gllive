#pragma once
#include <stdio.h>
#include <winsock2.h>
#include <iphlpapi.h>
#include <windows.h>
#include <wlanapi.h>
#include <mmsystem.h>

#include <vector>
#include <algorithm>
#include <stdexcept>
#include <iostream>
#include <fstream>

#include <boost/smart_ptr.hpp>
#include <boost/bind.hpp>
#include <boost/ref.hpp>

#if 0
	
bool bWait = true;

VOID WlanNotification(WLAN_NOTIFICATION_DATA *wlanNotifData,VOID *p)
{
	if(wlanNotifData->NotificationCode == wlan_notification_acm_scan_complete)
	{
		bWait = false;
	}
	else if(wlanNotifData->NotificationCode == wlan_notification_acm_scan_fail)
	{
		printf("Scanning failed with error: %x\n", wlanNotifData->pData);
		bWait = false;
	}
}

bool IsVistaOrHigher()
{
	OSVERSIONINFO osVersion; ZeroMemory(&osVersion, sizeof(OSVERSIONINFO));
	osVersion.dwOSVersionInfoSize = sizeof(OSVERSIONINFO);
	
	if(!GetVersionEx(&osVersion))
		return false;

	if(osVersion.dwMajorVersion >= 6)
		return true;
	return false;
}

	HANDLE hWlan = NULL;

	DWORD dwError = 0;
	DWORD dwSupportedVersion = 0;
	DWORD dwClientVersion = (IsVistaOrHigher() ? 2 : 1);
	
	GUID guidInterface;
	ZeroMemory(&guidInterface, sizeof(GUID));
	
	WLAN_INTERFACE_INFO_LIST *wlanInterfaceList = (WLAN_INTERFACE_INFO_LIST*)WlanAllocateMemory(sizeof(WLAN_INTERFACE_INFO_LIST));
	ZeroMemory(wlanInterfaceList, sizeof(WLAN_INTERFACE_INFO_LIST));
	
	WLAN_AVAILABLE_NETWORK_LIST *wlanNetworkList = (WLAN_AVAILABLE_NETWORK_LIST*)WlanAllocateMemory(sizeof(WLAN_AVAILABLE_NETWORK_LIST));
	ZeroMemory(wlanNetworkList, sizeof(WLAN_AVAILABLE_NETWORK_LIST));

	try
	{
		if(dwError = WlanOpenHandle(dwClientVersion, NULL, &dwSupportedVersion, &hWlan) != ERROR_SUCCESS)
			throw("[x] Unable access wireless interface");

		if(dwError = WlanEnumInterfaces(hWlan, NULL, &wlanInterfaceList) != ERROR_SUCCESS)
			throw("[x] Unable to enum wireless interfaces");
		
		wprintf(L"[!] Found adapter %s\n", wlanInterfaceList->InterfaceInfo[0].strInterfaceDescription);

		if(dwError = wlanInterfaceList->InterfaceInfo[0].isState != wlan_interface_state_not_ready)
		{
				if(wlanInterfaceList->dwNumberOfItems > 1)
				{
					// TODO: Add processing for multiple wireless cards here
					printf("[!] Detected multiple wireless adapters, using default\n");
					guidInterface = wlanInterfaceList->InterfaceInfo[0].InterfaceGuid;
				}
				else
				{
					guidInterface = wlanInterfaceList->InterfaceInfo[0].InterfaceGuid;
				}
		}
		else
			throw("[x] Default wireless adapter disabled");

		DWORD dwPrevNotif = 0;

		// Scan takes awhile so we need to register a callback
		if(dwError = WlanRegisterNotification(hWlan, WLAN_NOTIFICATION_SOURCE_ACM, TRUE,
		  (WLAN_NOTIFICATION_CALLBACK)WlanNotification, NULL, NULL, &dwPrevNotif) != ERROR_SUCCESS)
			throw("[x] Unable to register for notifications");

		printf("[i] Scanning for nearby networks...\n");
		if(dwError = WlanScan(hWlan, &guidInterface, NULL, NULL, NULL) != ERROR_SUCCESS)
			throw("[x] Scan failed, check adapter is enabled");
		
		// Yawn...
		while(bWait)
			Sleep(100);

		// Unregister callback, don't care if it succeeds or not
		WlanRegisterNotification(hWlan, WLAN_NOTIFICATION_SOURCE_NONE, TRUE, NULL, NULL, NULL, &dwPrevNotif);
		
		if(dwError = WlanGetAvailableNetworkList(hWlan, &guidInterface, NULL, NULL, &wlanNetworkList) != ERROR_SUCCESS)
			throw("[x] Unable to obtain network list");
		
		printf("\n%32s\tSIGNAL\tSECURITY\n", "SSID");
		for(unsigned int i = 0; i < wlanNetworkList->dwNumberOfItems; i++)
		{
				printf("%32s\t%d%%",
						wlanNetworkList->Network[i].dot11Ssid.ucSSID,
						wlanNetworkList->Network[i].wlanSignalQuality);
						
				printf("\t");
				switch(wlanNetworkList->Network[i].dot11DefaultAuthAlgorithm)
				{
						case DOT11_AUTH_ALGO_80211_OPEN:
						case DOT11_AUTH_ALGO_80211_SHARED_KEY:
							printf("WEP");
						break;
							
						case DOT11_AUTH_ALGO_WPA:
						case DOT11_AUTH_ALGO_WPA_PSK:
						case DOT11_AUTH_ALGO_WPA_NONE:
							printf("WPA");
						break;

						case DOT11_AUTH_ALGO_RSNA:
						case DOT11_AUTH_ALGO_RSNA_PSK:
							printf("WPA2");
						break;

						default:
							printf("UNKNOWN");
						break;
				}
				printf("\n");
		}
	}
	catch(char *szError)
	{
		printf("%s (0x%X)\nQuitting...\n", szError);
	}

	if(wlanNetworkList)
		WlanFreeMemory(wlanNetworkList);
	if(wlanInterfaceList)
		WlanFreeMemory(wlanInterfaceList);
	if(hWlan)
		WlanCloseHandle(hWlan, NULL);

	return dwError;
#endif