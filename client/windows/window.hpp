#pragma once
#include <atom/util/wwindow.hpp>

class window;

ATOM_DEF_ONNCHITTEST( window )
ATOM_DEF_ONPAINT( window )
ATOM_DEF_ONSETTINGCHANGE( window )
ATOM_DEF_ONLBUTTONDOWN( window )
ATOM_DEF_ONLBUTTONUP( window )
ATOM_DEF_ONMOUSEMOVE( window )
ATOM_DEF_ONCLOSE( window )

class window : public atom::wwindow< window, LOKI_TYPELIST_7( onnchittest_pair_t, onpaint_pair_t, onsettingchange_pair_t, onlbuttondown_pair_t, onlbuttonup_pair_t, onmousemove_pair_t, onclose_pair_t ) >
{
public:
	///
	window() : wwindow( *this, INITLIST_7( &window::onnchittest, &window::onpaint, &window::onsettingchange, &window::onlbuttondown, &window::onlbuttonup, &window::onmousemove, &window::onclose ) ) {
	}
	///
	LRESULT
	onnchittest( HWND hWnd, int x, int y );
	///
	void
	onpaint( HWND hWnd );
	///
	void
	onsettingchange( HWND hWnd, UINT action, LPCTSTR area );
	///
	void
	onlbuttondown( HWND hWnd, BOOL fDoubleClick, int x, int y, UINT keyFlags );
	///
	void
	onlbuttonup( HWND hWnd, int x, int y, UINT keyFlags );
	///
	void
	onmousemove( HWND hWnd, int x, int y, UINT keyFlags );
	///
	void
	onclose( HWND hWnd );

protected:
private:
};